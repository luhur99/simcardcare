import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export type SimStatus = 
  | "WAREHOUSE" 
  | "ACTIVATED" 
  | "INSTALLED" 
  | "BILLING" 
  | "GRACE_PERIOD" 
  | "DEACTIVATED";

export interface SimCard {
  id: string;
  iccid: string;
  phone_number: string | null;
  provider: string;
  plan_name: string | null;
  status: SimStatus;
  current_imei: string | null;
  activation_date: string | null;
  installation_date: string | null;
  deactivation_date: string | null;
  billing_cycle_day: number | null;
  monthly_cost: number | null;
  accumulated_cost: number | null;
  is_reactivated: boolean;
  replacement_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Device {
  id: string;
  imei: string;
  device_model: string | null;
  manufacturer: string | null;
  purchase_date: string | null;
  warranty_expiry: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  company_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Installation {
  id: string;
  sim_card_id: string;
  device_id: string;
  customer_id: string | null;
  installation_date: string;
  removal_date: string | null;
  installation_notes: string | null;
  removal_notes: string | null;
  installed_by: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StatusHistory {
  id: string;
  sim_card_id: string;
  old_status: SimStatus | null;
  new_status: SimStatus;
  changed_by: string | null;
  reason: string | null;
  changed_at: string;
}

export interface DailyBurdenLog {
  id: string;
  sim_card_id: string;
  calculation_type: string;
  start_date: string;
  end_date: string;
  days_count: number;
  daily_rate: number;
  total_cost: number;
  description: string | null;
  calculated_at: string;
}

export interface DailyBurdenResult {
  overlap_1_days: number;
  overlap_1_cost: number;
  overlap_2_days: number;
  overlap_2_cost: number;
  total_burden: number;
}