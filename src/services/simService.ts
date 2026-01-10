import { supabase, SimCard, Device, Customer, SimStatus, DailyBurdenResult, DailyBurdenLog } from "@/lib/supabase";

// Helper to calculate daily burden (client-side for mock data)
export function calculateDailyBurden(sim: SimCard): DailyBurdenResult {
  const monthlyRate = sim.monthly_cost || 0;
  const dailyRate = monthlyRate / 30;

  let overlap1Days = 0;
  let overlap1Cost = 0;
  let overlap2Days = 0;
  let overlap2Cost = 0;

  // OVERLAP 1: Activation Date → Installation Date
  if (sim.activation_date && sim.installation_date) {
    const activationDate = new Date(sim.activation_date);
    const installationDate = new Date(sim.installation_date);
    
    if (installationDate > activationDate) {
      overlap1Days = Math.floor((installationDate.getTime() - activationDate.getTime()) / (1000 * 60 * 60 * 24));
      overlap1Cost = overlap1Days * dailyRate;
    }
  }

  // OVERLAP 2: Due Date → Deactivation Date
  if (sim.deactivation_date && sim.billing_cycle_day) {
    const deactivationDate = new Date(sim.deactivation_date);
    
    // Calculate the due date (last billing cycle day before deactivation)
    const dueDate = new Date(deactivationDate.getFullYear(), deactivationDate.getMonth(), sim.billing_cycle_day);
    
    // If due date is after deactivation, use previous month
    if (dueDate > deactivationDate) {
      dueDate.setMonth(dueDate.getMonth() - 1);
    }

    if (deactivationDate > dueDate) {
      overlap2Days = Math.floor((deactivationDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      overlap2Cost = overlap2Days * dailyRate;
    }
  }

  return {
    overlap_1_days: overlap1Days,
    overlap_1_cost: overlap1Cost,
    overlap_2_days: overlap2Days,
    overlap_2_cost: overlap2Cost,
    total_burden: overlap1Cost + overlap2Cost
  };
}

// Calculate Grace Period Cost
export function calculateGracePeriodCost(sim: SimCard): {
  gracePeriodDays: number;
  gracePeriodCost: number;
} {
  if (sim.status !== 'GRACE_PERIOD' || !sim.installation_date) {
    return { gracePeriodDays: 0, gracePeriodCost: 0 };
  }

  const now = new Date();
  const installDate = new Date(sim.installation_date);
  const monthlyRate = sim.monthly_cost || 0;
  const dailyRate = monthlyRate / 30;

  // Grace period = dari installation sampai sekarang (atau deactivation date)
  const endDate = sim.deactivation_date ? new Date(sim.deactivation_date) : now;
  const gracePeriodDays = Math.floor((endDate.getTime() - installDate.getTime()) / (1000 * 60 * 60 * 24));
  const gracePeriodCost = gracePeriodDays * dailyRate;

  return {
    gracePeriodDays,
    gracePeriodCost
  };
}

// Mock Data for initial setup
const MOCK_SIMS: SimCard[] = [
  {
    id: "1",
    iccid: "89620012345678901234",
    phone_number: "081234567890",
    provider: "Telkomsel",
    plan_name: "Corporate 50GB",
    status: "INSTALLED",
    current_imei: "123456789012345",
    activation_date: "2026-01-01",
    installation_date: "2026-01-05",
    deactivation_date: null,
    deactivation_reason: null,
    billing_cycle_day: 1,
    monthly_cost: 150000,
    accumulated_cost: 0,
    is_reactivated: false,
    replacement_reason: null,
    notes: "Batch 1 - Test with overlap calculation",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    iccid: "89620098765432109876",
    phone_number: "081987654321",
    provider: "XL Axiata",
    plan_name: "Business Unlimited",
    status: "ACTIVATED",
    current_imei: null,
    activation_date: "2026-01-03",
    installation_date: null,
    deactivation_date: null,
    deactivation_reason: null,
    billing_cycle_day: 1,
    monthly_cost: 200000,
    accumulated_cost: 0,
    is_reactivated: false,
    replacement_reason: null,
    notes: "Batch 1 - Waiting installation",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    iccid: null,
    phone_number: "081555555555",
    provider: "Indosat",
    plan_name: "Freedom Combo",
    status: "DEACTIVATED",
    current_imei: null,
    activation_date: "2025-12-01",
    installation_date: "2025-12-03",
    deactivation_date: "2025-12-28",
    deactivation_reason: null,
    billing_cycle_day: 1,
    monthly_cost: 100000,
    accumulated_cost: 95666.67,
    is_reactivated: false,
    replacement_reason: null,
    notes: "Deactivated card without ICCID",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

const MOCK_DEVICES: Device[] = [
  {
    id: "1",
    imei: "123456789012345",
    model: "iPhone 14 Pro",
    brand: "Apple",
    device_type: "Smartphone",
    serial_number: "SN123456",
    status: "AVAILABLE",
    customer_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    imei: "987654321098765",
    model: "Samsung S23",
    brand: "Samsung",
    device_type: "Smartphone",
    serial_number: "SN987654",
    status: "IN_USE",
    customer_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

// Helper to check if Supabase is connected
const isSupabaseConnected = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!url && !!key && url !== "https://placeholder.supabase.co" && key !== "placeholder";
};

// LocalStorage Keys
const STORAGE_KEYS = {
  SIMS: 'bkt_sims',
  DEVICES: 'bkt_devices',
  CUSTOMERS: 'bkt_customers',
  HISTORY: 'bkt_history'
};

// Initialize LocalStorage if empty
if (typeof window !== 'undefined') {
  if (!localStorage.getItem(STORAGE_KEYS.SIMS)) {
    // Calculate accumulated costs for mock data
    const mockSimsWithCosts = MOCK_SIMS.map(sim => ({
      ...sim,
      accumulated_cost: calculateDailyBurden(sim).total_burden
    }));
    localStorage.setItem(STORAGE_KEYS.SIMS, JSON.stringify(mockSimsWithCosts));
  }
  if (!localStorage.getItem(STORAGE_KEYS.DEVICES)) {
    localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(MOCK_DEVICES));
  }
}

export const simService = {
  async getSimCards(): Promise<SimCard[]> {
    if (isSupabaseConnected()) {
      const { data, error } = await supabase.from('sim_cards').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as SimCard[];
    } else {
      // Mock Implementation
      const data = localStorage.getItem(STORAGE_KEYS.SIMS);
      return data ? JSON.parse(data) : [];
    }
  },

  async getSimCardById(id: string): Promise<SimCard | null> {
    if (isSupabaseConnected()) {
      const { data, error } = await supabase.from('sim_cards').select('*').eq('id', id).single();
      if (error) throw error;
      return data as SimCard;
    } else {
      const sims = JSON.parse(localStorage.getItem(STORAGE_KEYS.SIMS) || '[]');
      return sims.find((s: SimCard) => s.id === id) || null;
    }
  },

  async getDevices(): Promise<Device[]> {
    if (isSupabaseConnected()) {
      const { data, error } = await supabase.from('devices').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as Device[];
    } else {
      const data = localStorage.getItem(STORAGE_KEYS.DEVICES);
      return data ? JSON.parse(data) : [];
    }
  },

  async createSimCard(sim: Omit<SimCard, 'id' | 'created_at' | 'updated_at'>): Promise<SimCard> {
    if (isSupabaseConnected()) {
      const { data, error } = await supabase.from('sim_cards').insert(sim).select().single();
      if (error) throw error;
      return data as SimCard;
    } else {
      // Validation: Check phone_number uniqueness
      const existingSims: SimCard[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SIMS) || '[]');
      const phoneConflict = existingSims.find(s => s.phone_number === sim.phone_number);
      
      if (phoneConflict) {
        throw new Error("Nomor SIM Card ini sudah terdaftar!");
      }

      // Validation: Mocking the Unique Active IMEI Constraint
      if (sim.status !== 'DEACTIVATED' && sim.current_imei) {
        const conflict = existingSims.find(s => 
          s.status !== 'DEACTIVATED' && 
          s.current_imei === sim.current_imei
        );
        
        if (conflict) {
          throw new Error("IMEI ini sudah terikat dengan kartu aktif lain!");
        }
      }

      const newSim: SimCard = {
        ...sim,
        id: Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Calculate accumulated cost
      const burden = calculateDailyBurden(newSim);
      newSim.accumulated_cost = burden.total_burden;
      
      const sims = JSON.parse(localStorage.getItem(STORAGE_KEYS.SIMS) || '[]');
      sims.unshift(newSim);
      localStorage.setItem(STORAGE_KEYS.SIMS, JSON.stringify(sims));
      return newSim;
    }
  },

  async updateSimCard(id: string, updates: Partial<SimCard>): Promise<SimCard> {
    if (isSupabaseConnected()) {
      const { data, error } = await supabase
        .from('sim_cards')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as SimCard;
    } else {
      const sims: SimCard[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SIMS) || '[]');
      const index = sims.findIndex(s => s.id === id);
      
      if (index === -1) {
        throw new Error("SIM Card not found");
      }

      // IMEI validation for updates
      if (updates.current_imei && updates.status !== 'DEACTIVATED') {
        const conflict = sims.find(s => 
          s.id !== id &&
          s.status !== 'DEACTIVATED' && 
          s.current_imei === updates.current_imei
        );
        
        if (conflict) {
          throw new Error("IMEI ini sudah terikat dengan kartu aktif lain!");
        }
      }

      const updatedSim = { ...sims[index], ...updates, updated_at: new Date().toISOString() };
      
      // Recalculate accumulated cost
      const burden = calculateDailyBurden(updatedSim);
      updatedSim.accumulated_cost = burden.total_burden;

      sims[index] = updatedSim;
      localStorage.setItem(STORAGE_KEYS.SIMS, JSON.stringify(sims));
      return updatedSim;
    }
  },

  async getDailyBurdenLogs(simCardId: string): Promise<DailyBurdenLog[]> {
    if (isSupabaseConnected()) {
      const { data, error } = await supabase
        .from('daily_burden_log')
        .select('*')
        .eq('sim_card_id', simCardId)
        .order('calculation_date', { ascending: false });
      if (error) throw error;
      return data as DailyBurdenLog[];
    } else {
      // Mock logs based on current sim card data
      const sim = await this.getSimCardById(simCardId);
      if (!sim) return [];

      const burden = calculateDailyBurden(sim);
      const logs: DailyBurdenLog[] = [];

      if (burden.overlap_1_cost > 0 && sim.activation_date && sim.installation_date) {
        logs.push({
          id: "log1",
          sim_card_id: simCardId,
          calculation_type: "OVERLAP_1",
          start_date: sim.activation_date,
          end_date: sim.installation_date,
          days_count: burden.overlap_1_days,
          daily_rate: (sim.monthly_cost || 0) / 30,
          total_cost: burden.overlap_1_cost,
          description: "Biaya overlap: Aktivasi → Instalasi",
          calculation_date: new Date().toISOString()
        });
      }

      if (burden.overlap_2_cost > 0 && sim.deactivation_date && sim.billing_cycle_day) {
        const deactivationDate = new Date(sim.deactivation_date);
        const dueDate = new Date(deactivationDate.getFullYear(), deactivationDate.getMonth(), sim.billing_cycle_day);
        if (dueDate > deactivationDate) {
          dueDate.setMonth(dueDate.getMonth() - 1);
        }

        logs.push({
          id: "log2",
          sim_card_id: simCardId,
          calculation_type: "OVERLAP_2",
          start_date: dueDate.toISOString().split('T')[0],
          end_date: sim.deactivation_date,
          days_count: burden.overlap_2_days,
          daily_rate: (sim.monthly_cost || 0) / 30,
          total_cost: burden.overlap_2_cost,
          description: "Biaya overlap: Jatuh Tempo → Deaktivasi",
          calculation_date: new Date().toISOString()
        });
      }

      return logs;
    }
  },
  
  async getStats() {
    if (isSupabaseConnected()) {
      const [sims, devices, customers] = await Promise.all([
        supabase.from('sim_cards').select('status', { count: 'exact' }),
        supabase.from('devices').select('id', { count: 'exact' }),
        supabase.from('customers').select('id', { count: 'exact' })
      ]);
      
      return {
        totalSims: sims.count || 0,
        activeDevices: devices.count || 0,
        customers: customers.count || 0,
        warehouse: sims.data?.filter(s => s.status === 'WAREHOUSE').length || 0
      };
    } else {
      const sims = JSON.parse(localStorage.getItem(STORAGE_KEYS.SIMS) || '[]');
      const devices = JSON.parse(localStorage.getItem(STORAGE_KEYS.DEVICES) || '[]');
      const customers = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS) || '[]');
      
      return {
        totalSims: sims.length,
        activeDevices: devices.length,
        customers: customers.length,
        warehouse: sims.filter((s: SimCard) => s.status === 'WAREHOUSE').length
      };
    }
  },

  // Quick Actions for Dashboard
  async activateSimCard(id: string, activationDate: string): Promise<SimCard> {
    // Check previous status for Reactivation logic
    const currentSim = await this.getSimCardById(id);
    const isReactivation = currentSim?.status === 'DEACTIVATED';

    return this.updateSimCard(id, {
      status: 'ACTIVATED',
      activation_date: activationDate,
      is_reactivated: isReactivation
    });
  },

  async installSimCard(id: string, installationDate: string, imei: string, freePulsaMonths?: number): Promise<SimCard> {
    // REPLACEMENT LOGIC: Check for existing active SIM on this IMEI
    if (isSupabaseConnected()) {
      const { data: existingSims } = await supabase
        .from('sim_cards')
        .select('*')
        .eq('current_imei', imei)
        .neq('status', 'DEACTIVATED')
        .neq('id', id); // Exclude self if already assigned

      if (existingSims && existingSims.length > 0) {
        const oldSim = existingSims[0];
        console.log(`Replacement detected: Deactivating old SIM ${oldSim.iccid} for IMEI ${imei}`);
        
        // Deactivate the old SIM
        await this.deactivateSimCard(
          oldSim.id, 
          installationDate, 
          "Auto-deactivated due to SIM Replacement",
          "SIM_REPLACED"
        );
      }
    } else {
      // Mock logic for replacement
      const sims = JSON.parse(localStorage.getItem(STORAGE_KEYS.SIMS) || '[]');
      const conflict = sims.find((s: SimCard) => 
        s.current_imei === imei && 
        s.status !== 'DEACTIVATED' && 
        s.id !== id
      );
      
      if (conflict) {
        console.log(`Mock Replacement: Deactivating old SIM ${conflict.iccid}`);
        await this.deactivateSimCard(
          conflict.id, 
          installationDate, 
          "Auto-deactivated due to SIM Replacement",
          "SIM_REPLACED"
        );
      }
    }

    return this.updateSimCard(id, {
      status: 'INSTALLED',
      installation_date: installationDate,
      current_imei: imei,
      free_pulsa_months: freePulsaMonths
    });
  },

  async deactivateSimCard(id: string, deactivationDate: string, reason?: string, replacementReason?: string): Promise<SimCard> {
    return this.updateSimCard(id, {
      status: 'DEACTIVATED',
      deactivation_date: deactivationDate,
      notes: reason ? `${reason}` : undefined,
      replacement_reason: replacementReason || null
    });
  },

  async enterGracePeriod(id: string, gracePeriodStartDate: string): Promise<SimCard> {
    // Check previous status for Reactivation logic
    const currentSim = await this.getSimCardById(id);
    const isReactivation = currentSim?.status === 'DEACTIVATED';

    return this.updateSimCard(id, {
      status: 'GRACE_PERIOD',
      activation_date: gracePeriodStartDate,
      is_reactivated: isReactivation
    });
  },

  async reactivateFromGracePeriod(id: string, activationDate: string): Promise<SimCard> {
    // Check previous status for Reactivation logic
    const currentSim = await this.getSimCardById(id);
    const isReactivation = currentSim?.status === 'DEACTIVATED';

    return this.updateSimCard(id, {
      status: 'ACTIVATED',
      activation_date: activationDate,
      is_reactivated: isReactivation
    });
  }
};