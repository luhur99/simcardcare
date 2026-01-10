-- Add new columns to existing sim_cards table
ALTER TABLE sim_cards 
ADD COLUMN IF NOT EXISTS is_reactivated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS replacement_reason VARCHAR(255);

-- Add comment for documentation
COMMENT ON COLUMN sim_cards.is_reactivated IS 'TRUE if SIM was reactivated after deactivation. Reactivated SIMs skip free pulse and start billing immediately';
COMMENT ON COLUMN sim_cards.replacement_reason IS 'Reason for replacement when SIM is replaced on an IMEI (e.g., SIM_REPLACED)';