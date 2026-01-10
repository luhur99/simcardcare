-- BKT-SimCare Database Schema
-- PostgreSQL Schema for SIM Card Management System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM for SIM card status
CREATE TYPE sim_status AS ENUM (
  'WAREHOUSE',
  'ACTIVATED', 
  'INSTALLED',
  'BILLING',
  'GRACE_PERIOD',
  'DEACTIVATED'
);

-- Customers Table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  company_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Devices Table
CREATE TABLE devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  imei VARCHAR(15) NOT NULL UNIQUE,
  device_model VARCHAR(255),
  manufacturer VARCHAR(255),
  purchase_date DATE,
  warranty_expiry DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SIM Cards Table
CREATE TABLE sim_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  iccid VARCHAR(20),
  phone_number VARCHAR(20) NOT NULL UNIQUE,
  provider VARCHAR(100) NOT NULL,
  plan_name VARCHAR(100),
  status sim_status NOT NULL DEFAULT 'WAREHOUSE',
  current_imei VARCHAR(15),
  activation_date DATE,
  installation_date DATE,
  deactivation_date DATE,
  deactivation_reason TEXT, -- Added column
  billing_cycle_day INTEGER,
  monthly_cost DECIMAL(10, 2) DEFAULT 0,
  accumulated_cost DECIMAL(12, 2) DEFAULT 0,
  is_reactivated BOOLEAN DEFAULT FALSE,
  replacement_reason VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (current_imei) REFERENCES devices(imei) ON DELETE SET NULL
);

-- Installations Table
CREATE TABLE installations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sim_card_id UUID NOT NULL,
  device_id UUID NOT NULL,
  customer_id UUID,
  installation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  removal_date TIMESTAMP WITH TIME ZONE,
  installation_notes TEXT,
  removal_notes TEXT,
  installed_by VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (sim_card_id) REFERENCES sim_cards(id) ON DELETE CASCADE,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

-- Status History Table
CREATE TABLE status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sim_card_id UUID NOT NULL,
  old_status sim_status,
  new_status sim_status NOT NULL,
  changed_by VARCHAR(255),
  reason TEXT,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (sim_card_id) REFERENCES sim_cards(id) ON DELETE CASCADE
);

-- Daily Burden Calculation Log Table
CREATE TABLE daily_burden_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sim_card_id UUID NOT NULL,
  calculation_type VARCHAR(50) NOT NULL, -- 'OVERLAP_1' or 'OVERLAP_2'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_count INTEGER NOT NULL,
  daily_rate DECIMAL(10, 2) NOT NULL,
  total_cost DECIMAL(12, 2) NOT NULL,
  description TEXT,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (sim_card_id) REFERENCES sim_cards(id) ON DELETE CASCADE
);

-- CRITICAL: Unique Index for IMEI Constraint
-- Ensures no two active SIM cards can use the same IMEI
CREATE UNIQUE INDEX unique_active_imei ON sim_cards(current_imei) 
WHERE status != 'DEACTIVATED' AND current_imei IS NOT NULL;

-- Function to calculate daily burden (Daily Rate = monthly_cost / 30)
CREATE OR REPLACE FUNCTION calculate_daily_burden(
  p_sim_card_id UUID
)
RETURNS TABLE(
  overlap_1_days INTEGER,
  overlap_1_cost DECIMAL(12, 2),
  overlap_2_days INTEGER,
  overlap_2_cost DECIMAL(12, 2),
  total_burden DECIMAL(12, 2)
) AS $$
DECLARE
  v_monthly_cost DECIMAL(10, 2);
  v_daily_rate DECIMAL(10, 2);
  v_activation_date DATE;
  v_installation_date DATE;
  v_deactivation_date DATE;
  v_billing_cycle_day INTEGER;
  v_due_date DATE;
  v_overlap_1_days INTEGER := 0;
  v_overlap_1_cost DECIMAL(12, 2) := 0;
  v_overlap_2_days INTEGER := 0;
  v_overlap_2_cost DECIMAL(12, 2) := 0;
BEGIN
  -- Get SIM card details
  SELECT 
    monthly_cost, 
    activation_date, 
    installation_date, 
    deactivation_date,
    billing_cycle_day
  INTO 
    v_monthly_cost, 
    v_activation_date, 
    v_installation_date, 
    v_deactivation_date,
    v_billing_cycle_day
  FROM sim_cards
  WHERE id = p_sim_card_id;

  -- Calculate daily rate
  v_daily_rate := COALESCE(v_monthly_cost, 0) / 30.0;

  -- OVERLAP 1: Activation Date → Installation Date
  IF v_activation_date IS NOT NULL AND v_installation_date IS NOT NULL THEN
    IF v_installation_date > v_activation_date THEN
      v_overlap_1_days := v_installation_date - v_activation_date;
      v_overlap_1_cost := v_overlap_1_days * v_daily_rate;
    END IF;
  END IF;

  -- OVERLAP 2: Due Date → Deactivation Date
  IF v_deactivation_date IS NOT NULL AND v_billing_cycle_day IS NOT NULL THEN
    -- Calculate the due date (last billing cycle day before deactivation)
    v_due_date := DATE_TRUNC('month', v_deactivation_date) + 
                  INTERVAL '1 day' * (v_billing_cycle_day - 1);
    
    -- If due date is after deactivation, use previous month
    IF v_due_date > v_deactivation_date THEN
      v_due_date := (DATE_TRUNC('month', v_deactivation_date) - INTERVAL '1 month') + 
                    INTERVAL '1 day' * (v_billing_cycle_day - 1);
    END IF;

    IF v_deactivation_date > v_due_date THEN
      v_overlap_2_days := v_deactivation_date - v_due_date;
      v_overlap_2_cost := v_overlap_2_days * v_daily_rate;
    END IF;
  END IF;

  -- Return results
  RETURN QUERY SELECT 
    v_overlap_1_days,
    v_overlap_1_cost,
    v_overlap_2_days,
    v_overlap_2_cost,
    (v_overlap_1_cost + v_overlap_2_cost) AS total_burden;
END;
$$ LANGUAGE plpgsql;

-- Function to update accumulated cost
CREATE OR REPLACE FUNCTION update_accumulated_cost()
RETURNS TRIGGER AS $$
DECLARE
  v_burden_result RECORD;
BEGIN
  -- Calculate daily burden
  SELECT * INTO v_burden_result 
  FROM calculate_daily_burden(NEW.id);

  -- Update accumulated cost
  NEW.accumulated_cost := COALESCE(v_burden_result.total_burden, 0);

  -- Log the calculation if there's a cost
  IF v_burden_result.overlap_1_cost > 0 THEN
    INSERT INTO daily_burden_log (
      sim_card_id, 
      calculation_type, 
      start_date, 
      end_date, 
      days_count, 
      daily_rate, 
      total_cost,
      description
    )
    VALUES (
      NEW.id,
      'OVERLAP_1',
      NEW.activation_date,
      NEW.installation_date,
      v_burden_result.overlap_1_days,
      NEW.monthly_cost / 30.0,
      v_burden_result.overlap_1_cost,
      'Biaya overlap: Aktivasi → Instalasi'
    )
    ON CONFLICT DO NOTHING;
  END IF;

  IF v_burden_result.overlap_2_cost > 0 THEN
    INSERT INTO daily_burden_log (
      sim_card_id,
      calculation_type,
      start_date,
      end_date,
      days_count,
      daily_rate,
      total_cost,
      description
    )
    VALUES (
      NEW.id,
      'OVERLAP_2',
      (DATE_TRUNC('month', NEW.deactivation_date) + 
       INTERVAL '1 day' * (NEW.billing_cycle_day - 1))::DATE,
      NEW.deactivation_date,
      v_burden_result.overlap_2_days,
      NEW.monthly_cost / 30.0,
      v_burden_result.overlap_2_cost,
      'Biaya overlap: Jatuh Tempo → Deaktivasi'
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically calculate accumulated cost
CREATE TRIGGER calculate_burden_trigger
BEFORE INSERT OR UPDATE OF activation_date, installation_date, deactivation_date, monthly_cost
ON sim_cards
FOR EACH ROW
EXECUTE FUNCTION update_accumulated_cost();

-- Function to automatically log status changes
CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO status_history (sim_card_id, old_status, new_status)
    VALUES (NEW.id, OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically log status changes
CREATE TRIGGER sim_status_change_trigger
AFTER UPDATE ON sim_cards
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION log_status_change();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at on all tables
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON devices
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sim_cards_updated_at BEFORE UPDATE ON sim_cards
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_installations_updated_at BEFORE UPDATE ON installations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for better query performance
CREATE INDEX idx_sim_cards_status ON sim_cards(status);
CREATE INDEX idx_sim_cards_phone ON sim_cards(phone_number);
CREATE INDEX idx_sim_cards_iccid ON sim_cards(iccid);
CREATE INDEX idx_devices_imei ON devices(imei);
CREATE INDEX idx_installations_sim ON installations(sim_card_id);
CREATE INDEX idx_installations_device ON installations(device_id);
CREATE INDEX idx_installations_customer ON installations(customer_id);
CREATE INDEX idx_installations_active ON installations(is_active);
CREATE INDEX idx_status_history_sim ON status_history(sim_card_id);
CREATE INDEX idx_status_history_date ON status_history(changed_at);
CREATE INDEX idx_daily_burden_sim ON daily_burden_log(sim_card_id);
CREATE INDEX idx_daily_burden_type ON daily_burden_log(calculation_type);

-- Comments for documentation
COMMENT ON TABLE sim_cards IS 'Stores SIM card information with lifecycle status tracking and daily burden calculation';
COMMENT ON TABLE devices IS 'Stores device information identified by IMEI';
COMMENT ON TABLE customers IS 'Stores customer information';
COMMENT ON TABLE installations IS 'Tracks SIM card installations in devices';
COMMENT ON TABLE status_history IS 'Audit log for SIM card status changes';
COMMENT ON TABLE daily_burden_log IS 'Logs daily burden calculations for audit trail';

COMMENT ON COLUMN sim_cards.monthly_cost IS 'Monthly subscription cost in Rupiah';
COMMENT ON COLUMN sim_cards.accumulated_cost IS 'Automatically calculated total burden cost (Overlap 1 + Overlap 2)';
COMMENT ON COLUMN sim_cards.activation_date IS 'Date when SIM card was activated';
COMMENT ON COLUMN sim_cards.installation_date IS 'Date when SIM card was installed in device';
COMMENT ON COLUMN sim_cards.deactivation_date IS 'Date when SIM card was deactivated';

COMMENT ON CONSTRAINT unique_active_imei ON sim_cards IS 'Ensures no two active SIM cards share the same IMEI. Violation message: IMEI ini sudah terikat dengan kartu aktif lain!';

-- Sample data for testing (optional - remove if not needed)
INSERT INTO customers (name, email, phone, company_name) VALUES
('PT. Teknologi Indonesia', 'admin@teknologi.co.id', '021-12345678', 'PT. Teknologi Indonesia'),
('CV. Digital Nusantara', 'contact@digitalnusantara.id', '021-87654321', 'CV. Digital Nusantara');

INSERT INTO devices (imei, device_model, manufacturer) VALUES
('123456789012345', 'iPhone 14 Pro', 'Apple'),
('987654321098765', 'Samsung Galaxy S23', 'Samsung');

INSERT INTO sim_cards (phone_number, iccid, provider, plan_type, status, monthly_cost, activation_date, installation_date) VALUES
('081234567890', '89620012345678901234', 'Telkomsel', 'Corporate 50GB', 'INSTALLED', 150000, '2026-01-01', '2026-01-05'),
('081987654321', '89620098765432109876', 'XL Axiata', 'Business Unlimited', 'WAREHOUSE', 200000, NULL, NULL);