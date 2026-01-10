-- Now create a separate trigger for logging (runs AFTER, so record already exists)
CREATE OR REPLACE FUNCTION log_daily_burden_calculation()
RETURNS TRIGGER AS $$
DECLARE
    daily_rate NUMERIC(10,2) := 0;
    overlap_1_days INT := 0;
    overlap_1_cost NUMERIC(10,2) := 0;
    overlap_2_days INT := 0;
    overlap_2_cost NUMERIC(10,2) := 0;
    total_burden NUMERIC(10,2) := 0;
    due_date DATE;
BEGIN
    -- Only log if monthly_cost is set and accumulated_cost changed
    IF NEW.monthly_cost IS NULL OR NEW.monthly_cost = 0 THEN
        RETURN NEW;
    END IF;

    -- Recalculate for logging (same logic as main function)
    daily_rate := NEW.monthly_cost / 30.0;

    IF NEW.activation_date IS NOT NULL AND NEW.installation_date IS NOT NULL THEN
        overlap_1_days := EXTRACT(DAY FROM (NEW.installation_date - NEW.activation_date));
        IF overlap_1_days > 0 THEN
            overlap_1_cost := overlap_1_days * daily_rate;
        END IF;
    END IF;

    IF NEW.deactivation_date IS NOT NULL AND NEW.billing_cycle_day IS NOT NULL THEN
        IF EXTRACT(DAY FROM NEW.deactivation_date) >= NEW.billing_cycle_day THEN
            due_date := DATE_TRUNC('month', NEW.deactivation_date) + (NEW.billing_cycle_day - 1) * INTERVAL '1 day';
        ELSE
            due_date := DATE_TRUNC('month', NEW.deactivation_date) - INTERVAL '1 month' + (NEW.billing_cycle_day - 1) * INTERVAL '1 day';
        END IF;

        overlap_2_days := EXTRACT(DAY FROM (NEW.deactivation_date - due_date));
        IF overlap_2_days > 0 THEN
            overlap_2_cost := overlap_2_days * daily_rate;
        END IF;
    END IF;

    total_burden := overlap_1_cost + overlap_2_cost;

    -- Insert log entry (NOW the sim_card record exists)
    INSERT INTO daily_burden_log (
        sim_card_id,
        monthly_cost,
        daily_rate,
        overlap_1_days,
        overlap_1_cost,
        overlap_2_days,
        overlap_2_cost,
        total_burden,
        notes
    ) VALUES (
        NEW.id,
        NEW.monthly_cost,
        daily_rate,
        overlap_1_days,
        overlap_1_cost,
        overlap_2_days,
        overlap_2_cost,
        total_burden,
        'Auto-calculated on ' || CASE 
            WHEN TG_OP = 'INSERT' THEN 'insert'
            WHEN TG_OP = 'UPDATE' THEN 'update'
            ELSE 'unknown'
        END
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create AFTER trigger for logging
CREATE TRIGGER log_burden_calculation_trigger
    AFTER INSERT OR UPDATE OF monthly_cost, activation_date, installation_date, deactivation_date, billing_cycle_day
    ON sim_cards
    FOR EACH ROW
    EXECUTE FUNCTION log_daily_burden_calculation();