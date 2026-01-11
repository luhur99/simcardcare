-- Add billing_cycle_source column to sim_cards table
ALTER TABLE sim_cards 
ADD COLUMN IF NOT EXISTS billing_cycle_source TEXT CHECK (billing_cycle_source IN ('provider', 'installation', 'custom'));

-- Add comment to explain the column
COMMENT ON COLUMN sim_cards.billing_cycle_source IS 'Source of billing cycle day: provider (from provider settings), installation (from installation date), or custom (manually set)';