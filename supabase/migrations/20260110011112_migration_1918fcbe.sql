-- Drop and recreate the calculate_daily_burden function with correct date arithmetic
DROP FUNCTION IF EXISTS calculate_daily_burden() CASCADE;

CREATE OR REPLACE FUNCTION calculate_daily_burden()
RETURNS TRIGGER AS $$
DECLARE
    daily_rate NUMERIC := 0;
    overlap_1_days INTEGER := 0;
    overlap_1_cost NUMERIC := 0;
    overlap_2_days INTEGER := 0;
    overlap_2_cost NUMERIC := 0;
    due_date DATE;
BEGIN
    -- Only calculate if monthly_cost is set
    IF NEW.monthly_cost IS NULL OR NEW.monthly_cost = 0 THEN
        NEW.accumulated_cost := 0;
        RETURN NEW;
    END IF;

    -- Calculate daily rate
    daily_rate := NEW.monthly_cost / 30.0;

    -- Calculate Overlap 1: Activation to Installation
    IF NEW.activation_date IS NOT NULL AND NEW.installation_date IS NOT NULL THEN
        -- Direct subtraction of DATEs gives INTEGER days
        overlap_1_days := NEW.installation_date - NEW.activation_date;
        IF overlap_1_days > 0 THEN
            overlap_1_cost := overlap_1_days * daily_rate;
        END IF;
    END IF;

    -- Calculate Overlap 2: Due Date to Deactivation
    IF NEW.deactivation_date IS NOT NULL AND NEW.billing_cycle_day IS NOT NULL THEN
        -- Find the last billing cycle day before deactivation
        -- Start from deactivation date and work backwards to find billing day
        due_date := DATE_TRUNC('month', NEW.deactivation_date) + (NEW.billing_cycle_day - 1) * INTERVAL '1 day';
        
        -- If due date is after deactivation, go back one month
        IF due_date > NEW.deactivation_date THEN
            due_date := DATE_TRUNC('month', NEW.deactivation_date - INTERVAL '1 month') + (NEW.billing_cycle_day - 1) * INTERVAL '1 day';
        END IF;

        overlap_2_days := NEW.deactivation_date - due_date;
        IF overlap_2_days > 0 THEN
            overlap_2_cost := overlap_2_days * daily_rate;
        END IF;
    END IF;

    -- Update accumulated cost
    NEW.accumulated_cost := overlap_1_cost + overlap_2_cost;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER calculate_burden_trigger
    BEFORE INSERT OR UPDATE OF monthly_cost, activation_date, installation_date, deactivation_date, billing_cycle_day
    ON sim_cards
    FOR EACH ROW
    EXECUTE FUNCTION calculate_daily_burden();