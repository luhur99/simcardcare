-- BKT-SimCare Database Schema
-- PostgreSQL Schema for SIM Card Management System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM type for SIM status
DO $$ BEGIN
    CREATE TYPE sim_status AS ENUM (
        'WAREHOUSE',
        'ACTIVATED', 
        'INSTALLED',
        'BILLING',
        'GRACE_PERIOD',
        'DEACTIVATED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Table: customers
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    company VARCHAR(255),
    tax_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: devices
CREATE TABLE IF NOT EXISTS devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    imei VARCHAR(20) UNIQUE NOT NULL,
    device_type VARCHAR(100),
    brand VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    status VARCHAR(50) DEFAULT 'AVAILABLE',
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: sim_cards (with Daily Burden columns)
CREATE TABLE IF NOT EXISTS sim_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    iccid VARCHAR(25) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    provider VARCHAR(100),
    plan_name VARCHAR(100),
    current_imei VARCHAR(20),
    status sim_status NOT NULL DEFAULT 'WAREHOUSE',
    monthly_cost DECIMAL(12,2) DEFAULT 0,
    accumulated_cost DECIMAL(15,2) DEFAULT 0,
    activation_date DATE,
    installation_date DATE,
    deactivation_date DATE,
    billing_cycle_day INTEGER CHECK (billing_cycle_day BETWEEN 1 AND 31),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: installations
CREATE TABLE IF NOT EXISTS installations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sim_card_id UUID NOT NULL REFERENCES sim_cards(id) ON DELETE CASCADE,
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    removed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: status_history
CREATE TABLE IF NOT EXISTS status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sim_card_id UUID NOT NULL REFERENCES sim_cards(id) ON DELETE CASCADE,
    old_status sim_status,
    new_status sim_status NOT NULL,
    changed_by VARCHAR(255),
    reason TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: daily_burden_log (for audit trail)
CREATE TABLE IF NOT EXISTS daily_burden_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sim_card_id UUID NOT NULL REFERENCES sim_cards(id) ON DELETE CASCADE,
    calculation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    monthly_cost DECIMAL(12,2),
    daily_rate DECIMAL(12,2),
    overlap_1_days INTEGER,
    overlap_1_cost DECIMAL(12,2),
    overlap_2_days INTEGER,
    overlap_2_cost DECIMAL(12,2),
    total_burden DECIMAL(15,2),
    notes TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sim_cards_status ON sim_cards(status);
CREATE INDEX IF NOT EXISTS idx_sim_cards_iccid ON sim_cards(iccid);
CREATE INDEX IF NOT EXISTS idx_sim_cards_phone ON sim_cards(phone_number);
CREATE INDEX IF NOT EXISTS idx_devices_imei ON devices(imei);
CREATE INDEX IF NOT EXISTS idx_installations_sim ON installations(sim_card_id);
CREATE INDEX IF NOT EXISTS idx_status_history_sim ON status_history(sim_card_id);
CREATE INDEX IF NOT EXISTS idx_daily_burden_log_sim ON daily_burden_log(sim_card_id);

-- CRITICAL: Unique constraint for IMEI on active SIM cards
-- Prevents duplicate IMEI usage across non-deactivated SIM cards
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_imei 
ON sim_cards(current_imei) 
WHERE status != 'DEACTIVATED' AND current_imei IS NOT NULL;

-- Function: Calculate Daily Burden
CREATE OR REPLACE FUNCTION calculate_daily_burden()
RETURNS TRIGGER AS $$
DECLARE
    daily_rate DECIMAL(12,2);
    overlap_1_days INTEGER := 0;
    overlap_1_cost DECIMAL(12,2) := 0;
    overlap_2_days INTEGER := 0;
    overlap_2_cost DECIMAL(12,2) := 0;
    total_burden DECIMAL(15,2) := 0;
    due_date DATE;
BEGIN
    -- Only calculate if monthly_cost is set
    IF NEW.monthly_cost IS NULL OR NEW.monthly_cost = 0 THEN
        NEW.accumulated_cost := 0;
        RETURN NEW;
    END IF;

    -- Calculate daily rate
    daily_rate := NEW.monthly_cost / 30;

    -- Overlap 1: Activation Date to Installation Date
    IF NEW.activation_date IS NOT NULL AND NEW.installation_date IS NOT NULL THEN
        overlap_1_days := NEW.installation_date - NEW.activation_date;
        IF overlap_1_days > 0 THEN
            overlap_1_cost := overlap_1_days * daily_rate;
        END IF;
    END IF;

    -- Overlap 2: Due Date to Deactivation Date
    IF NEW.deactivation_date IS NOT NULL AND NEW.billing_cycle_day IS NOT NULL THEN
        -- Calculate the last billing cycle day before deactivation
        due_date := DATE_TRUNC('month', NEW.deactivation_date) + 
                    INTERVAL '1 day' * (NEW.billing_cycle_day - 1);
        
        -- If due date is after deactivation, use previous month
        IF due_date > NEW.deactivation_date THEN
            due_date := DATE_TRUNC('month', NEW.deactivation_date) - INTERVAL '1 month' +
                        INTERVAL '1 day' * (NEW.billing_cycle_day - 1);
        END IF;

        overlap_2_days := NEW.deactivation_date - due_date;
        IF overlap_2_days > 0 THEN
            overlap_2_cost := overlap_2_days * daily_rate;
        END IF;
    END IF;

    -- Calculate total burden
    total_burden := overlap_1_cost + overlap_2_cost;
    NEW.accumulated_cost := total_burden;

    -- Log the calculation
    INSERT INTO daily_burden_log (
        sim_card_id,
        monthly_cost,
        daily_rate,
        overlap_1_days,
        overlap_1_cost,
        overlap_2_days,
        overlap_2_cost,
        total_burden,
        notes
    ) VALUES (
        NEW.id,
        NEW.monthly_cost,
        daily_rate,
        overlap_1_days,
        overlap_1_cost,
        overlap_2_days,
        overlap_2_cost,
        total_burden,
        'Auto-calculated on ' || CASE 
            WHEN TG_OP = 'INSERT' THEN 'insert'
            WHEN TG_OP = 'UPDATE' THEN 'update'
            ELSE 'unknown'
        END
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-calculate daily burden on insert/update
DROP TRIGGER IF EXISTS calculate_burden_trigger ON sim_cards;
CREATE TRIGGER calculate_burden_trigger
    BEFORE INSERT OR UPDATE OF 
        monthly_cost, 
        activation_date, 
        installation_date, 
        deactivation_date,
        billing_cycle_day
    ON sim_cards
    FOR EACH ROW
    EXECUTE FUNCTION calculate_daily_burden();

-- Function: Log status changes
CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO status_history (sim_card_id, old_status, new_status, changed_at)
        VALUES (NEW.id, OLD.status, NEW.status, NOW());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-log status changes
DROP TRIGGER IF EXISTS log_status_trigger ON sim_cards;
CREATE TRIGGER log_status_trigger
    AFTER UPDATE ON sim_cards
    FOR EACH ROW
    EXECUTE FUNCTION log_status_change();

-- Enable Row Level Security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE sim_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_burden_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow all operations for authenticated users
CREATE POLICY "Allow all for authenticated users" ON customers FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON devices FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON sim_cards FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON installations FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON status_history FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON daily_burden_log FOR ALL USING (true);