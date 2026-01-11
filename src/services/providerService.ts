import { supabase } from "@/lib/supabase";

export interface Provider {
  id: string;
  name: string;
  contact_person: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  billing_cycle_day: number | null;  // ⭐ NEW: Default billing cycle day (1-31)
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CreateProviderInput = {
  name: string;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  billing_cycle_day?: number;  // ⭐ NEW
  notes?: string;
  is_active?: boolean;
};

export type UpdateProviderInput = Partial<CreateProviderInput>;

class ProviderService {
  private readonly STORAGE_KEY = "bkt_providers";
  private readonly isSupabaseConnected: boolean;

  constructor() {
    this.isSupabaseConnected = false;
  }

  // Mock data for localStorage
  private getMockProviders(): Provider[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }

    // Initialize with sample data
    const mockProviders: Provider[] = [
      {
        id: "provider-1",
        name: "Telkomsel",
        contact_person: "Ahmad Santoso",
        contact_phone: "08123456789",
        contact_email: "ahmad@telkomsel.com",
        billing_cycle_day: 1,  // ⭐ Billing on 1st of every month
        notes: "Main provider for corporate",
        is_active: true,
        created_at: "2026-01-11T01:17:58Z",
        updated_at: "2026-01-11T01:17:58Z"
      },
      {
        id: "provider-2",
        name: "Indosat Ooredoo",
        contact_person: "Budi Hartono",
        contact_phone: "08567891234",
        contact_email: "budi@indosat.com",
        billing_cycle_day: 10,  // ⭐ Billing on 10th of every month
        notes: null,
        is_active: true,
        created_at: "2026-01-11T01:17:58Z",
        updated_at: "2026-01-11T01:17:58Z"
      },
      {
        id: "provider-3",
        name: "XL Axiata",
        contact_person: null,
        contact_phone: "08765432109",
        contact_email: "sales@xl.co.id",
        billing_cycle_day: 15,  // ⭐ Billing on 15th of every month
        notes: "Backup provider",
        is_active: true,
        created_at: "2026-01-11T01:17:58Z",
        updated_at: "2026-01-11T01:17:58Z"
      }
    ];

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(mockProviders));
    return mockProviders;
  }

  private saveMockProviders(providers: Provider[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(providers));
  }

  // Get all providers
  async getAllProviders(): Promise<Provider[]> {
    if (this.isSupabaseConnected) {
      const { data, error } = await supabase
        .from("providers")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return data || [];
    }

    return this.getMockProviders();
  }

  // Get provider by ID
  async getProviderById(id: string): Promise<Provider | null> {
    if (this.isSupabaseConnected) {
      const { data, error } = await supabase
        .from("providers")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    }

    const providers = this.getMockProviders();
    return providers.find((p) => p.id === id) || null;
  }

  // Create provider
  async createProvider(input: CreateProviderInput): Promise<Provider> {
    const isSupabaseConnected = false; // Will be true when Supabase is connected

    if (isSupabaseConnected) {
      const { data, error } = await supabase
        .from("providers")
        .insert([
          {
            name: input.name,
            contact_person: input.contact_person || null,
            contact_phone: input.contact_phone || null,
            contact_email: input.contact_email || null,
            billing_cycle_day: input.billing_cycle_day || null,  // ⭐ NEW
            notes: input.notes || null,
            is_active: true,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    // Mock implementation
    const newProvider: Provider = {
      id: `provider-${Date.now()}`,
      name: input.name,
      contact_person: input.contact_person || null,
      contact_phone: input.contact_phone || null,
      contact_email: input.contact_email || null,
      billing_cycle_day: input.billing_cycle_day || null,  // ⭐ NEW
      notes: input.notes || null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const providers = this.getMockProviders();
    providers.push(newProvider);
    this.saveMockProviders(providers);

    return newProvider;
  }

  // Update provider
  async updateProvider(
    id: string,
    updates: UpdateProviderInput
  ): Promise<Provider> {
    const isSupabaseConnected = false;

    if (isSupabaseConnected) {
      const { data, error } = await supabase
        .from("providers")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    // Mock implementation
    const providers = this.getMockProviders();
    const index = providers.findIndex((p) => p.id === id);

    if (index === -1) {
      throw new Error("Provider not found");
    }

    providers[index] = {
      ...providers[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    this.saveMockProviders(providers);
    return providers[index];
  }

  // Delete provider
  async deleteProvider(id: string): Promise<void> {
    if (this.isSupabaseConnected) {
      const { error } = await supabase.from("providers").delete().eq("id", id);

      if (error) throw error;
      return;
    }

    const providers = this.getMockProviders();
    const filtered = providers.filter((p) => p.id !== id);
    this.saveMockProviders(filtered);
  }

  // Toggle provider active status
  async toggleProviderStatus(id: string): Promise<Provider> {
    const provider = await this.getProviderById(id);
    if (!provider) {
      throw new Error("Provider not found");
    }

    return this.updateProvider(id, { is_active: !provider.is_active });
  }
}

export const providerService = new ProviderService();