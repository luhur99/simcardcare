-- Drop existing trigger first
DROP TRIGGER IF EXISTS calculate_burden_trigger ON sim_cards;

-- Recreate the function with better error handling and deferred logging
CREATE OR REPLACE FUNCTION calculate_daily_burden()
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
    -- Only calculate if monthly_cost is set
    IF NEW.monthly_cost IS NULL OR NEW.monthly_cost = 0 THEN
        NEW.accumulated_cost := 0;
        RETURN NEW;
    END IF;

    -- Calculate daily rate
    daily_rate := NEW.monthly_cost / 30.0;

    -- Calculate Overlap 1: Activation to Installation
    IF NEW.activation_date IS NOT NULL AND NEW.installation_date IS NOT NULL THEN
        overlap_1_days := EXTRACT(DAY FROM (NEW.installation_date - NEW.activation_date));
        IF overlap_1_days > 0 THEN
            overlap_1_cost := overlap_1_days * daily_rate;
        END IF;
    END IF;

    -- Calculate Overlap 2: Due Date to Deactivation
    IF NEW.deactivation_date IS NOT NULL AND NEW.billing_cycle_day IS NOT NULL THEN
        -- Find the last billing cycle day before deactivation
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

    -- Calculate total burden
    total_burden := overlap_1_cost + overlap_2_cost;
    NEW.accumulated_cost := total_burden;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that runs BEFORE insert/update to modify the NEW record
CREATE TRIGGER calculate_burden_trigger
    BEFORE INSERT OR UPDATE OF monthly_cost, activation_date, installation_date, deactivation_date, billing_cycle_day
    ON sim_cards
    FOR EACH ROW
    EXECUTE FUNCTION calculate_daily_burden();