-- Create the missing trigger function and trigger for status logging
CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) OR TG_OP = 'INSERT' THEN
        INSERT INTO status_history (sim_card_id, old_status, new_status, changed_by, reason)
        VALUES (NEW.id, OLD.status, NEW.status, 'system', 'Status change recorded');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER log_status_changes
    AFTER INSERT OR UPDATE ON sim_cards
    FOR EACH ROW
    EXECUTE FUNCTION log_status_change();