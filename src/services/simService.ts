import { supabase, SimCard, Device, Customer, SimStatus } from "@/lib/supabase";

// Mock Data for initial setup
const MOCK_SIMS: SimCard[] = [
  {
    id: "1",
    iccid: "89620012345678901234",
    phone_number: "081234567890",
    provider: "Telkomsel",
    plan_type: "Corporate 50GB",
    status: "WAREHOUSE",
    current_imei: null,
    activation_date: null,
    billing_cycle_day: 1,
    monthly_cost: 150000,
    notes: "Batch 1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    iccid: "89620098765432109876",
    phone_number: "081987654321",
    provider: "XL Axiata",
    plan_type: "Business Unlimited",
    status: "ACTIVATED",
    current_imei: "123456789012345",
    activation_date: new Date().toISOString(),
    billing_cycle_day: 15,
    monthly_cost: 200000,
    notes: "Batch 1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

const MOCK_DEVICES: Device[] = [
  {
    id: "1",
    imei: "123456789012345",
    device_model: "iPhone 14 Pro",
    manufacturer: "Apple",
    purchase_date: "2023-01-01",
    warranty_expiry: "2024-01-01",
    notes: "Office use",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    imei: "987654321098765",
    device_model: "Samsung S23",
    manufacturer: "Samsung",
    purchase_date: "2023-02-01",
    warranty_expiry: "2024-02-01",
    notes: "Field use",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

// Helper to check if Supabase is connected
const isSupabaseConnected = () => {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
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
    localStorage.setItem(STORAGE_KEYS.SIMS, JSON.stringify(MOCK_SIMS));
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
      // Validation: Mocking the Unique Active IMEI Constraint
      if (sim.status !== 'DEACTIVATED' && sim.current_imei) {
        const existingSims: SimCard[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SIMS) || '[]');
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
      
      const sims = JSON.parse(localStorage.getItem(STORAGE_KEYS.SIMS) || '[]');
      sims.unshift(newSim);
      localStorage.setItem(STORAGE_KEYS.SIMS, JSON.stringify(sims));
      return newSim;
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
  }
};