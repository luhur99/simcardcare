-- Add free_pulsa columns to sim_cards table
ALTER TABLE sim_cards 
ADD COLUMN IF NOT EXISTS free_pulsa_months INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS free_pulsa DECIMAL(10, 2) DEFAULT 0;

COMMENT ON COLUMN sim_cards.free_pulsa_months IS 'Number of free months (0-3) given at installation';
COMMENT ON COLUMN sim_cards.free_pulsa IS 'Total free pulsa cost (free_pulsa_months × monthly_cost)';