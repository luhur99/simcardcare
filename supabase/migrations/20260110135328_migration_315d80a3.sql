-- Add grace period tracking columns to sim_cards table
ALTER TABLE sim_cards 
ADD COLUMN grace_period_start_date DATE,
ADD COLUMN grace_period_due_date DATE;

-- Add comments
COMMENT ON COLUMN sim_cards.grace_period_start_date IS 'Tanggal mulai masa grace period (masuk dari INSTALLED)';
COMMENT ON COLUMN sim_cards.grace_period_due_date IS 'Batas bayar langganan pulsa - deadline sebelum deaktivasi';

-- Create index for better query performance
CREATE INDEX idx_sim_cards_grace_period_dates ON sim_cards(grace_period_start_date, grace_period_due_date) 
WHERE status = 'GRACE_PERIOD';