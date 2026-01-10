-- Drop both functions and recreate with correct date arithmetic
DROP FUNCTION IF EXISTS calculate_daily_burden() CASCADE;
DROP FUNCTION IF EXISTS log_daily_burden_calculation() CASCADE;

-- Recreate calculate_daily_burden with correct date arithmetic
CREATE OR REPLACE FUNCTION calculate_daily_burden()
RETURNS TRIGGER AS $$
DECLARE
    daily_rate NUMERIC;
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
        -- Simple subtraction of dates gives integer days
        overlap_1_days := NEW.installation_date - NEW.activation_date;
        overlap_1_cost := overlap_1_days * daily_rate;
    END IF;

    -- Calculate Overlap 2: Due Date to Deactivation
    IF NEW.deactivation_date IS NOT NULL AND NEW.billing_cycle_day IS NOT NULL THEN
        -- Find the last billing cycle day before deactivation
        due_date := DATE_TRUNC('month', NEW.deactivation_date) + (NEW.billing_cycle_day - 1) * INTERVAL '1 day';
        
        -- If due date is after deactivation, use previous month
        IF due_date > NEW.deactivation_date THEN
            due_date := (DATE_TRUNC('month', NEW.deactivation_date) - INTERVAL '1 month') + (NEW.billing_cycle_day - 1) * INTERVAL '1 day';
        END IF;
        
        -- Calculate days between due date and deactivation
        overlap_2_days := NEW.deactivation_date - due_date;
        overlap_2_cost := overlap_2_days * daily_rate;
    END IF;

    -- Update accumulated cost
    NEW.accumulated_cost := COALESCE(overlap_1_cost, 0) + COALESCE(overlap_2_cost, 0);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate log_daily_burden_calculation with correct date arithmetic
CREATE OR REPLACE FUNCTION log_daily_burden_calculation()
RETURNS TRIGGER AS $$
DECLARE
    daily_rate NUMERIC;
    overlap_1_days INTEGER := 0;
    overlap_1_cost NUMERIC := 0;
    overlap_2_days INTEGER := 0;
    overlap_2_cost NUMERIC := 0;
    due_date DATE;
    total_burden NUMERIC := 0;
BEGIN
    -- Only log if monthly_cost is set
    IF NEW.monthly_cost IS NULL OR NEW.monthly_cost = 0 THEN
        RETURN NEW;
    END IF;

    -- Calculate daily rate
    daily_rate := NEW.monthly_cost / 30.0;

    -- Calculate Overlap 1: Activation to Installation
    IF NEW.activation_date IS NOT NULL AND NEW.installation_date IS NOT NULL THEN
        overlap_1_days := NEW.installation_date - NEW.activation_date;
        overlap_1_cost := overlap_1_days * daily_rate;
    END IF;

    -- Calculate Overlap 2: Due Date to Deactivation
    IF NEW.deactivation_date IS NOT NULL AND NEW.billing_cycle_day IS NOT NULL THEN
        -- Find the last billing cycle day before deactivation
        due_date := DATE_TRUNC('month', NEW.deactivation_date) + (NEW.billing_cycle_day - 1) * INTERVAL '1 day';
        
        -- If due date is after deactivation, use previous month
        IF due_date > NEW.deactivation_date THEN
            due_date := (DATE_TRUNC('month', NEW.deactivation_date) - INTERVAL '1 month') + (NEW.billing_cycle_day - 1) * INTERVAL '1 day';
        END IF;
        
        overlap_2_days := NEW.deactivation_date - due_date;
        overlap_2_cost := overlap_2_days * daily_rate;
    END IF;

    total_burden := COALESCE(overlap_1_cost, 0) + COALESCE(overlap_2_cost, 0);

    -- Insert into log table
    INSERT INTO daily_burden_log (
        sim_card_id,
        calculation_date,
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
        CURRENT_DATE,
        NEW.monthly_cost,
        daily_rate,
        overlap_1_days,
        overlap_1_cost,
        overlap_2_days,
        overlap_2_cost,
        total_burden,
        'Auto-calculated on ' || to_char(CURRENT_TIMESTAMP, 'YYYY-MM-DD HH24:MI:SS')
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate triggers
CREATE TRIGGER calculate_burden_trigger
    BEFORE INSERT OR UPDATE OF monthly_cost, activation_date, installation_date, deactivation_date, billing_cycle_day
    ON sim_cards
    FOR EACH ROW
    EXECUTE FUNCTION calculate_daily_burden();

CREATE TRIGGER log_burden_trigger
    AFTER INSERT OR UPDATE OF monthly_cost, activation_date, installation_date, deactivation_date, billing_cycle_day
    ON sim_cards
    FOR EACH ROW
    EXECUTE FUNCTION log_daily_burden_calculation();