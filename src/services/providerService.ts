import { supabase } from "@/lib/supabase";

export interface Provider {
  id: string;
  name: string;
  contact_person: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProviderInput {
  name: string;
  contact_person?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  notes?: string | null;
}

export interface UpdateProviderInput {
  name?: string;
  contact_person?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  notes?: string | null;
  is_active?: boolean;
}

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
        notes: "Main provider for corporate",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "provider-2",
        name: "Indosat Ooredoo",
        contact_person: "Budi Hartono",
        contact_phone: "08567891234",
        contact_email: "budi@indosat.com",
        notes: null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "provider-3",
        name: "XL Axiata",
        contact_person: null,
        contact_phone: "08765432109",
        contact_email: "sales@xl.co.id",
        notes: "Backup provider",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
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
    if (this.isSupabaseConnected) {
      const { data, error } = await supabase
        .from("providers")
        .insert({
          name: input.name,
          contact_person: input.contact_person,
          contact_phone: input.contact_phone,
          contact_email: input.contact_email,
          notes: input.notes,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    const providers = this.getMockProviders();
    const newProvider: Provider = {
      id: `provider-${Date.now()}`,
      name: input.name,
      contact_person: input.contact_person || null,
      contact_phone: input.contact_phone || null,
      contact_email: input.contact_email || null,
      notes: input.notes || null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    providers.push(newProvider);
    this.saveMockProviders(providers);
    return newProvider;
  }

  // Update provider
  async updateProvider(
    id: string,
    updates: UpdateProviderInput
  ): Promise<Provider> {
    if (this.isSupabaseConnected) {
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