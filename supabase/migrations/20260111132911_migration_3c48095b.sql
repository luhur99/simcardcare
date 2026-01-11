-- Add missing columns to sim_cards table
ALTER TABLE sim_cards ADD COLUMN IF NOT EXISTS deactivation_reason TEXT;
ALTER TABLE sim_cards ADD COLUMN IF NOT EXISTS replacement_reason TEXT;
ALTER TABLE sim_cards ADD COLUMN IF NOT EXISTS is_reactivated BOOLEAN DEFAULT false;