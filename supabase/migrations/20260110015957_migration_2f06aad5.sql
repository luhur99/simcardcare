-- Update ICCID to optional and phone_number to mandatory + unique
ALTER TABLE sim_cards ALTER COLUMN iccid DROP NOT NULL;
ALTER TABLE sim_cards ALTER COLUMN phone_number SET NOT NULL;