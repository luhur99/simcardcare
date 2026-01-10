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
  iccid VARCHAR(20) NOT NULL UNIQUE,
  phone_number VARCHAR(20) UNIQUE,
  provider VARCHAR(100) NOT NULL,
  plan_type VARCHAR(100),
  status sim_status NOT NULL DEFAULT 'WAREHOUSE',
  current_imei VARCHAR(15),
  activation_date DATE,
  billing_cycle_day INTEGER,
  monthly_cost DECIMAL(10, 2),
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

-- CRITICAL: Unique Index for IMEI Constraint
-- Ensures no two active SIM cards can use the same IMEI
CREATE UNIQUE INDEX unique_active_imei ON sim_cards(current_imei) 
WHERE status != 'DEACTIVATED' AND current_imei IS NOT NULL;

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

-- Comments for documentation
COMMENT ON TABLE sim_cards IS 'Stores SIM card information with lifecycle status tracking';
COMMENT ON TABLE devices IS 'Stores device information identified by IMEI';
COMMENT ON TABLE customers IS 'Stores customer information';
COMMENT ON TABLE installations IS 'Tracks SIM card installations in devices';
COMMENT ON TABLE status_history IS 'Audit log for SIM card status changes';

COMMENT ON CONSTRAINT unique_active_imei ON sim_cards IS 'Ensures no two active SIM cards share the same IMEI. Violation message: IMEI ini sudah terikat dengan kartu aktif lain!';

-- Sample data for testing (optional - remove if not needed)
INSERT INTO customers (name, email, phone, company_name) VALUES
('PT. Teknologi Indonesia', 'admin@teknologi.co.id', '021-12345678', 'PT. Teknologi Indonesia'),
('CV. Digital Nusantara', 'contact@digitalnusantara.id', '021-87654321', 'CV. Digital Nusantara');

INSERT INTO devices (imei, device_model, manufacturer) VALUES
('123456789012345', 'iPhone 14 Pro', 'Apple'),
('987654321098765', 'Samsung Galaxy S23', 'Samsung');

INSERT INTO sim_cards (iccid, phone_number, provider, plan_type, status, monthly_cost) VALUES
('89620012345678901234', '081234567890', 'Telkomsel', 'Corporate 50GB', 'WAREHOUSE', 150000),
('89620098765432109876', '081987654321', 'XL Axiata', 'Business Unlimited', 'WAREHOUSE', 200000);