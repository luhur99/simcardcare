-- Add free_pulsa_months column to sim_cards table
ALTER TABLE sim_cards 
ADD COLUMN free_pulsa_months INTEGER DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN sim_cards.free_pulsa_months IS 'Durasi masa free pulsa (1-3 bulan) yang diberikan saat instalasi';