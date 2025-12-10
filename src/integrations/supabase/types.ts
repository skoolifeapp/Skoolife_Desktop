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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_plans: {
        Row: {
          config_json: Json | null
          created_at: string | null
          id: string
          user_id: string
          week_start_date: string
        }
        Insert: {
          config_json?: Json | null
          created_at?: string | null
          id?: string
          user_id: string
          week_start_date: string
        }
        Update: {
          config_json?: Json | null
          created_at?: string | null
          id?: string
          user_id?: string
          week_start_date?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          created_at: string | null
          end_datetime: string
          event_type: string | null
          id: string
          is_blocking: boolean | null
          location: string | null
          recurrence_group_id: string | null
          source: string | null
          start_datetime: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          end_datetime: string
          event_type?: string | null
          id?: string
          is_blocking?: boolean | null
          location?: string | null
          recurrence_group_id?: string | null
          source?: string | null
          start_datetime: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          end_datetime?: string
          event_type?: string | null
          id?: string
          is_blocking?: boolean | null
          location?: string | null
          recurrence_group_id?: string | null
          source?: string | null
          start_datetime?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      constraints: {
        Row: {
          created_at: string | null
          day_of_week: number | null
          description: string | null
          end_time: string | null
          id: string
          payload: Json | null
          specific_date: string | null
          start_time: string | null
          title: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          day_of_week?: number | null
          description?: string | null
          end_time?: string | null
          id?: string
          payload?: Json | null
          specific_date?: string | null
          start_time?: string | null
          title?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: number | null
          description?: string | null
          end_time?: string | null
          id?: string
          payload?: Json | null
          specific_date?: string | null
          start_time?: string | null
          title?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      conversation_messages: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          message: string
          sender_id: string
          sender_type: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          message: string
          sender_id: string
          sender_type: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          message?: string
          sender_id?: string
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      finance_accounts: {
        Row: {
          balance: number
          created_at: string
          currency: string
          iban: string | null
          id: string
          last_sync_at: string | null
          name: string
          provider: string
          provider_account_id: string | null
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          currency?: string
          iban?: string | null
          id?: string
          last_sync_at?: string | null
          name: string
          provider?: string
          provider_account_id?: string | null
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          currency?: string
          iban?: string | null
          id?: string
          last_sync_at?: string | null
          name?: string
          provider?: string
          provider_account_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      finance_budgets: {
        Row: {
          amount: number
          category_id: string
          created_at: string
          id: string
          month: string
          user_id: string
        }
        Insert: {
          amount?: number
          category_id: string
          created_at?: string
          id?: string
          month: string
          user_id: string
        }
        Update: {
          amount?: number
          category_id?: string
          created_at?: string
          id?: string
          month?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "finance_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_categories: {
        Row: {
          color: string
          created_at: string
          icon: string
          id: string
          name: string
          user_id: string | null
        }
        Insert: {
          color?: string
          created_at?: string
          icon?: string
          id?: string
          name: string
          user_id?: string | null
        }
        Update: {
          color?: string
          created_at?: string
          icon?: string
          id?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      finance_settings: {
        Row: {
          created_at: string
          has_seen_finance_tutorial: boolean
          id: string
          monthly_income_estimate: number | null
          primary_account_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          has_seen_finance_tutorial?: boolean
          id?: string
          monthly_income_estimate?: number | null
          primary_account_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          has_seen_finance_tutorial?: boolean
          id?: string
          monthly_income_estimate?: number | null
          primary_account_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_settings_primary_account_id_fkey"
            columns: ["primary_account_id"]
            isOneToOne: false
            referencedRelation: "finance_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_transactions: {
        Row: {
          account_id: string
          amount: number
          category_id: string | null
          created_at: string
          currency: string
          date: string
          id: string
          label: string
          source: string
          user_id: string
        }
        Insert: {
          account_id: string
          amount: number
          category_id?: string | null
          created_at?: string
          currency?: string
          date: string
          id?: string
          label: string
          source?: string
          user_id: string
        }
        Update: {
          account_id?: string
          amount?: number
          category_id?: string | null
          created_at?: string
          currency?: string
          date?: string
          id?: string
          label?: string
          source?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "finance_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "finance_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string | null
          has_seen_support_hint: boolean | null
          id: string
          is_onboarding_complete: boolean | null
          last_name: string | null
          level: string | null
          main_exam_period: string | null
          school: string | null
          updated_at: string | null
          weekly_revision_hours: number | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          has_seen_support_hint?: boolean | null
          id: string
          is_onboarding_complete?: boolean | null
          last_name?: string | null
          level?: string | null
          main_exam_period?: string | null
          school?: string | null
          updated_at?: string | null
          weekly_revision_hours?: number | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          has_seen_support_hint?: boolean | null
          id?: string
          is_onboarding_complete?: boolean | null
          last_name?: string | null
          level?: string | null
          main_exam_period?: string | null
          school?: string | null
          updated_at?: string | null
          weekly_revision_hours?: number | null
        }
        Relationships: []
      }
      revision_sessions: {
        Row: {
          created_at: string | null
          date: string
          end_time: string
          id: string
          notes: string | null
          start_time: string
          status: string | null
          subject_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          end_time: string
          id?: string
          notes?: string | null
          start_time: string
          status?: string | null
          subject_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          end_time?: string
          id?: string
          notes?: string | null
          start_time?: string
          status?: string | null
          subject_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "revision_sessions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          color: string | null
          created_at: string | null
          difficulty_level: string | null
          exam_date: string | null
          exam_weight: number | null
          id: string
          name: string
          notes: string | null
          status: string
          target_hours: number | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          difficulty_level?: string | null
          exam_date?: string | null
          exam_weight?: number | null
          id?: string
          name: string
          notes?: string | null
          status?: string
          target_hours?: number | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          difficulty_level?: string | null
          exam_date?: string | null
          exam_weight?: number | null
          id?: string
          name?: string
          notes?: string | null
          status?: string
          target_hours?: number | null
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          estimated_duration_minutes: number | null
          id: string
          linked_event_id: string | null
          priority: string
          status: string
          subject_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          linked_event_id?: string | null
          priority?: string
          status?: string
          subject_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          linked_event_id?: string | null
          priority?: string
          status?: string
          subject_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_linked_event_id_fkey"
            columns: ["linked_event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_feedback: {
        Row: {
          created_at: string
          id: string
          message: string
          route: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          route?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          route?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          avoid_early_morning: boolean | null
          avoid_late_evening: boolean | null
          created_at: string | null
          daily_end_time: string | null
          daily_start_time: string | null
          id: string
          max_hours_per_day: number | null
          notes: string | null
          preferred_days_of_week: number[] | null
          session_duration_minutes: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avoid_early_morning?: boolean | null
          avoid_late_evening?: boolean | null
          created_at?: string | null
          daily_end_time?: string | null
          daily_start_time?: string | null
          id?: string
          max_hours_per_day?: number | null
          notes?: string | null
          preferred_days_of_week?: number[] | null
          session_duration_minutes?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avoid_early_morning?: boolean | null
          avoid_late_evening?: boolean | null
          created_at?: string | null
          daily_end_time?: string | null
          daily_start_time?: string | null
          id?: string
          max_hours_per_day?: number | null
          notes?: string | null
          preferred_days_of_week?: number[] | null
          session_duration_minutes?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
