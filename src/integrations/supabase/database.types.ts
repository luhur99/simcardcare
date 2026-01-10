/* eslint-disable @typescript-eslint/no-empty-object-type */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      customers: {
        Row: {
          address: string | null
          company: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          tax_id: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          tax_id?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          tax_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_burden_log: {
        Row: {
          calculation_date: string | null
          daily_rate: number | null
          id: string
          monthly_cost: number | null
          notes: string | null
          overlap_1_cost: number | null
          overlap_1_days: number | null
          overlap_2_cost: number | null
          overlap_2_days: number | null
          sim_card_id: string
          total_burden: number | null
        }
        Insert: {
          calculation_date?: string | null
          daily_rate?: number | null
          id?: string
          monthly_cost?: number | null
          notes?: string | null
          overlap_1_cost?: number | null
          overlap_1_days?: number | null
          overlap_2_cost?: number | null
          overlap_2_days?: number | null
          sim_card_id: string
          total_burden?: number | null
        }
        Update: {
          calculation_date?: string | null
          daily_rate?: number | null
          id?: string
          monthly_cost?: number | null
          notes?: string | null
          overlap_1_cost?: number | null
          overlap_1_days?: number | null
          overlap_2_cost?: number | null
          overlap_2_days?: number | null
          sim_card_id?: string
          total_burden?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_burden_log_sim_card_id_fkey"
            columns: ["sim_card_id"]
            isOneToOne: false
            referencedRelation: "sim_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      devices: {
        Row: {
          brand: string | null
          created_at: string | null
          customer_id: string | null
          device_type: string | null
          id: string
          imei: string
          model: string | null
          serial_number: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          brand?: string | null
          created_at?: string | null
          customer_id?: string | null
          device_type?: string | null
          id?: string
          imei: string
          model?: string | null
          serial_number?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          brand?: string | null
          created_at?: string | null
          customer_id?: string | null
          device_type?: string | null
          id?: string
          imei?: string
          model?: string | null
          serial_number?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "devices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      installations: {
        Row: {
          created_at: string | null
          customer_id: string
          device_id: string
          id: string
          installed_at: string | null
          notes: string | null
          removed_at: string | null
          sim_card_id: string
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          device_id: string
          id?: string
          installed_at?: string | null
          notes?: string | null
          removed_at?: string | null
          sim_card_id: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          device_id?: string
          id?: string
          installed_at?: string | null
          notes?: string | null
          removed_at?: string | null
          sim_card_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "installations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installations_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installations_sim_card_id_fkey"
            columns: ["sim_card_id"]
            isOneToOne: false
            referencedRelation: "sim_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sim_cards: {
        Row: {
          accumulated_cost: number | null
          activation_date: string | null
          billing_cycle_day: number | null
          created_at: string | null
          current_imei: string | null
          deactivation_date: string | null
          deactivation_reason: string | null
          free_pulsa_months: number | null
          iccid: string | null
          id: string
          installation_date: string | null
          is_reactivated: boolean | null
          monthly_cost: number | null
          notes: string | null
          phone_number: string
          plan_name: string | null
          provider: string | null
          replacement_reason: string | null
          status: Database["public"]["Enums"]["sim_status"]
          updated_at: string | null
        }
        Insert: {
          accumulated_cost?: number | null
          activation_date?: string | null
          billing_cycle_day?: number | null
          created_at?: string | null
          current_imei?: string | null
          deactivation_date?: string | null
          deactivation_reason?: string | null
          free_pulsa_months?: number | null
          iccid?: string | null
          id?: string
          installation_date?: string | null
          is_reactivated?: boolean | null
          monthly_cost?: number | null
          notes?: string | null
          phone_number: string
          plan_name?: string | null
          provider?: string | null
          replacement_reason?: string | null
          status?: Database["public"]["Enums"]["sim_status"]
          updated_at?: string | null
        }
        Update: {
          accumulated_cost?: number | null
          activation_date?: string | null
          billing_cycle_day?: number | null
          created_at?: string | null
          current_imei?: string | null
          deactivation_date?: string | null
          deactivation_reason?: string | null
          free_pulsa_months?: number | null
          iccid?: string | null
          id?: string
          installation_date?: string | null
          is_reactivated?: boolean | null
          monthly_cost?: number | null
          notes?: string | null
          phone_number?: string
          plan_name?: string | null
          provider?: string | null
          replacement_reason?: string | null
          status?: Database["public"]["Enums"]["sim_status"]
          updated_at?: string | null
        }
        Relationships: []
      }
      status_history: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          id: string
          new_status: Database["public"]["Enums"]["sim_status"]
          old_status: Database["public"]["Enums"]["sim_status"] | null
          reason: string | null
          sim_card_id: string
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_status: Database["public"]["Enums"]["sim_status"]
          old_status?: Database["public"]["Enums"]["sim_status"] | null
          reason?: string | null
          sim_card_id: string
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_status?: Database["public"]["Enums"]["sim_status"]
          old_status?: Database["public"]["Enums"]["sim_status"] | null
          reason?: string | null
          sim_card_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "status_history_sim_card_id_fkey"
            columns: ["sim_card_id"]
            isOneToOne: false
            referencedRelation: "sim_cards"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      sim_status:
        | "WAREHOUSE"
        | "ACTIVATED"
        | "INSTALLED"
        | "BILLING"
        | "GRACE_PERIOD"
        | "DEACTIVATED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      sim_status: [
        "WAREHOUSE",
        "ACTIVATED",
        "INSTALLED",
        "BILLING",
        "GRACE_PERIOD",
        "DEACTIVATED",
      ],
    },
  },
} as const
