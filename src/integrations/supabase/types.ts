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
        Relationships: [
          {
            foreignKeyName: "ai_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "calendar_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "constraints_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_messages: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          message: string
          read_by_admin: boolean
          read_by_user: boolean
          sender_id: string
          sender_type: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          message: string
          read_by_admin?: boolean
          read_by_user?: boolean
          sender_id: string
          sender_type: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          message?: string
          read_by_admin?: boolean
          read_by_user?: boolean
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
        Relationships: [
          {
            foreignKeyName: "conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          {
            foreignKeyName: "revision_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      school_leads: {
        Row: {
          contact_email: string
          contact_phone: string | null
          created_at: string
          id: string
          message: string | null
          school_name: string
          school_type: string | null
          student_count: string | null
        }
        Insert: {
          contact_email: string
          contact_phone?: string | null
          created_at?: string
          id?: string
          message?: string | null
          school_name: string
          school_type?: string | null
          student_count?: string | null
        }
        Update: {
          contact_email?: string
          contact_phone?: string | null
          created_at?: string
          id?: string
          message?: string | null
          school_name?: string
          school_type?: string | null
          student_count?: string | null
        }
        Relationships: []
      }
      stats_snapshots: {
        Row: {
          active_users: number
          active_users_this_week: number
          completed_sessions: number
          created_at: string
          id: string
          nb_core_users: number
          nb_planning_generated_first_time: number
          nb_planning_generated_weekly: number
          nb_users_2plus_sessions_weekly: number
          nb_users_3plus_sessions_weekly: number
          nb_users_returning_without_nudge: number
          new_users_this_month: number
          open_conversations: number
          snapshot_date: string
          total_conversations: number
          total_events: number
          total_sessions: number
          total_subjects: number
          total_users: number
          users_generated_planning_weekly: number
        }
        Insert: {
          active_users?: number
          active_users_this_week?: number
          completed_sessions?: number
          created_at?: string
          id?: string
          nb_core_users?: number
          nb_planning_generated_first_time?: number
          nb_planning_generated_weekly?: number
          nb_users_2plus_sessions_weekly?: number
          nb_users_3plus_sessions_weekly?: number
          nb_users_returning_without_nudge?: number
          new_users_this_month?: number
          open_conversations?: number
          snapshot_date?: string
          total_conversations?: number
          total_events?: number
          total_sessions?: number
          total_subjects?: number
          total_users?: number
          users_generated_planning_weekly?: number
        }
        Update: {
          active_users?: number
          active_users_this_week?: number
          completed_sessions?: number
          created_at?: string
          id?: string
          nb_core_users?: number
          nb_planning_generated_first_time?: number
          nb_planning_generated_weekly?: number
          nb_users_2plus_sessions_weekly?: number
          nb_users_3plus_sessions_weekly?: number
          nb_users_returning_without_nudge?: number
          new_users_this_month?: number
          open_conversations?: number
          snapshot_date?: string
          total_conversations?: number
          total_events?: number
          total_sessions?: number
          total_subjects?: number
          total_users?: number
          users_generated_planning_weekly?: number
        }
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "subjects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity: {
        Row: {
          activity_type: string
          created_at: string
          id: string
          source: string | null
          user_id: string
        }
        Insert: {
          activity_type?: string
          created_at?: string
          id?: string
          source?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          id?: string
          source?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
        Relationships: [
          {
            foreignKeyName: "user_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
