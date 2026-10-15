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
    PostgrestVersion: "14.18"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      categories: {
        Row: {
          archived_at: string | null
          created_at: string
          id: string
          is_system: boolean
          key: string | null
          kind: string
          name: string
          sort_order: number
          user_id: string | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          id?: string
          is_system?: boolean
          key?: string | null
          kind: string
          name: string
          sort_order?: number
          user_id?: string | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          id?: string
          is_system?: boolean
          key?: string | null
          kind?: string
          name?: string
          sort_order?: number
          user_id?: string | null
        }
        Relationships: []
      }
      category_tax_lines: {
        Row: {
          category_id: string
          jurisdiction: string
          tax_line_id: string | null
        }
        Insert: {
          category_id: string
          jurisdiction: string
          tax_line_id?: string | null
        }
        Update: {
          category_id?: string
          jurisdiction?: string
          tax_line_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "category_tax_lines_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "category_tax_lines_tax_line_id_fkey"
            columns: ["tax_line_id"]
            isOneToOne: false
            referencedRelation: "tax_lines"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address: string
          created_at: string
          id: string
          name: string
          ownership_pct: number
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          created_at?: string
          id?: string
          name: string
          ownership_pct?: number
          updated_at?: string
          user_id?: string
        }
        Update: {
          address?: string
          created_at?: string
          id?: string
          name?: string
          ownership_pct?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      receipts: {
        Row: {
          file_key: string
          id: string
          mime_type: string
          original_file_name: string | null
          property_id: string | null
          size_bytes: number
          transaction_id: string | null
          uploaded_at: string
          user_id: string
        }
        Insert: {
          file_key: string
          id?: string
          mime_type: string
          original_file_name?: string | null
          property_id?: string | null
          size_bytes: number
          transaction_id?: string | null
          uploaded_at?: string
          user_id?: string
        }
        Update: {
          file_key?: string
          id?: string
          mime_type?: string
          original_file_name?: string | null
          property_id?: string | null
          size_bytes?: number
          transaction_id?: string | null
          uploaded_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_rules: {
        Row: {
          active: boolean
          amount_cents: number
          category_id: string
          created_at: string
          due_day: number | null
          due_last_day: boolean
          end_date: string | null
          frequency: string
          id: string
          is_capital: boolean
          kind: string
          note: string | null
          property_id: string
          split_template: Json | null
          start_date: string
          unit_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          amount_cents: number
          category_id: string
          created_at?: string
          due_day?: number | null
          due_last_day?: boolean
          end_date?: string | null
          frequency?: string
          id?: string
          is_capital?: boolean
          kind: string
          note?: string | null
          property_id: string
          split_template?: Json | null
          start_date: string
          unit_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          active?: boolean
          amount_cents?: number
          category_id?: string
          created_at?: string
          due_day?: number | null
          due_last_day?: boolean
          end_date?: string | null
          frequency?: string
          id?: string
          is_capital?: boolean
          kind?: string
          note?: string | null
          property_id?: string
          split_template?: Json | null
          start_date?: string
          unit_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_rules_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_rules_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_rules_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_lines: {
        Row: {
          code: string
          id: string
          jurisdiction: string
          kind: string
          label: string
        }
        Insert: {
          code: string
          id: string
          jurisdiction: string
          kind: string
          label: string
        }
        Update: {
          code?: string
          id?: string
          jurisdiction?: string
          kind?: string
          label?: string
        }
        Relationships: []
      }
      transaction_splits: {
        Row: {
          amount_cents: number
          basis_points: number
          transaction_id: string
          unit_id: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          basis_points: number
          transaction_id: string
          unit_id: string
          user_id?: string
        }
        Update: {
          amount_cents?: number
          basis_points?: number
          transaction_id?: string
          unit_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_splits_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_splits_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount_cents: number
          category_id: string
          created_at: string
          date: string
          id: string
          is_capital: boolean
          kind: string
          note: string | null
          occurrence_date: string | null
          property_id: string
          receipt_not_needed: boolean
          recurring_rule_id: string | null
          source: string
          status: string
          unit_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          category_id: string
          created_at?: string
          date: string
          id?: string
          is_capital?: boolean
          kind: string
          note?: string | null
          occurrence_date?: string | null
          property_id: string
          receipt_not_needed?: boolean
          recurring_rule_id?: string | null
          source?: string
          status?: string
          unit_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          amount_cents?: number
          category_id?: string
          created_at?: string
          date?: string
          id?: string
          is_capital?: boolean
          kind?: string
          note?: string | null
          occurrence_date?: string | null
          property_id?: string
          receipt_not_needed?: boolean
          recurring_rule_id?: string | null
          source?: string
          status?: string
          unit_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_recurring_rule_id_fkey"
            columns: ["recurring_rule_id"]
            isOneToOne: false
            referencedRelation: "recurring_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          created_at: string
          id: string
          label: string
          property_id: string
          rent_cents: number | null
          rent_due_day: number | null
          rent_due_last_day: boolean
          rent_start_date: string | null
          sort_order: number
          status: string
          tenant_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          property_id: string
          rent_cents?: number | null
          rent_due_day?: number | null
          rent_due_last_day?: boolean
          rent_start_date?: string | null
          sort_order?: number
          status?: string
          tenant_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          property_id?: string
          rent_cents?: number | null
          rent_due_day?: number | null
          rent_due_last_day?: boolean
          rent_start_date?: string | null
          sort_order?: number
          status?: string
          tenant_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string
          jurisdiction: string
          time_zone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          jurisdiction?: string
          time_zone?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          jurisdiction?: string
          time_zone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_property: {
        Args: {
          p_address: string
          p_name: string
          p_ownership_pct?: number
          p_units: Json
        }
        Returns: string
      }
      create_transaction: { Args: { p: Json }; Returns: string }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
