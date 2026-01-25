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
      access_codes: {
        Row: {
          class_id: string | null
          code: string
          cohort_id: string | null
          created_at: string | null
          created_by: string | null
          current_uses: number | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          school_id: string
        }
        Insert: {
          class_id?: string | null
          code: string
          cohort_id?: string | null
          created_at?: string | null
          created_by?: string | null
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          school_id: string
        }
        Update: {
          class_id?: string | null
          code?: string
          cohort_id?: string | null
          created_at?: string | null
          created_by?: string | null
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_codes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_codes_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_codes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_codes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
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
          subject_name: string | null
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
          subject_name?: string | null
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
          subject_name?: string | null
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
      classes: {
        Row: {
          cohort_id: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          school_id: string
          updated_at: string | null
        }
        Insert: {
          cohort_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          school_id: string
          updated_at?: string | null
        }
        Update: {
          cohort_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          school_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      cohorts: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          school_id: string
          updated_at: string | null
          year_end: number
          year_start: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          school_id: string
          updated_at?: string | null
          year_end?: number
          year_start?: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          school_id?: string
          updated_at?: string | null
          year_end?: number
          year_start?: number
        }
        Relationships: [
          {
            foreignKeyName: "cohorts_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
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
      file_annotations: {
        Row: {
          annotation_type: string
          color: string
          content: string | null
          created_at: string
          file_id: string
          id: string
          page_number: number
          position: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          annotation_type: string
          color?: string
          content?: string | null
          created_at?: string
          file_id: string
          id?: string
          page_number: number
          position: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          annotation_type?: string
          color?: string
          content?: string | null
          created_at?: string
          file_id?: string
          id?: string
          page_number?: number
          position?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_annotations_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "study_files"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcard_decks: {
        Row: {
          card_count: number | null
          created_at: string
          description: string | null
          id: string
          last_studied_at: string | null
          name: string
          subject_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          card_count?: number | null
          created_at?: string
          description?: string | null
          id?: string
          last_studied_at?: string | null
          name: string
          subject_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          card_count?: number | null
          created_at?: string
          description?: string | null
          id?: string
          last_studied_at?: string | null
          name?: string
          subject_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_decks_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flashcard_decks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcard_reviews: {
        Row: {
          easiness_factor_after: number | null
          easiness_factor_before: number | null
          flashcard_id: string
          id: string
          interval_after: number | null
          interval_before: number | null
          quality: number
          reviewed_at: string
          user_id: string
        }
        Insert: {
          easiness_factor_after?: number | null
          easiness_factor_before?: number | null
          flashcard_id: string
          id?: string
          interval_after?: number | null
          interval_before?: number | null
          quality: number
          reviewed_at?: string
          user_id: string
        }
        Update: {
          easiness_factor_after?: number | null
          easiness_factor_before?: number | null
          flashcard_id?: string
          id?: string
          interval_after?: number | null
          interval_before?: number | null
          quality?: number
          reviewed_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_reviews_flashcard_id_fkey"
            columns: ["flashcard_id"]
            isOneToOne: false
            referencedRelation: "flashcards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flashcard_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcards: {
        Row: {
          back: string
          correct_reviews: number | null
          created_at: string
          deck_id: string
          easiness_factor: number | null
          front: string
          id: string
          interval_days: number | null
          last_reviewed_at: string | null
          next_review_at: string | null
          repetition_count: number | null
          total_reviews: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          back: string
          correct_reviews?: number | null
          created_at?: string
          deck_id: string
          easiness_factor?: number | null
          front: string
          id?: string
          interval_days?: number | null
          last_reviewed_at?: string | null
          next_review_at?: string | null
          repetition_count?: number | null
          total_reviews?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          back?: string
          correct_reviews?: number | null
          created_at?: string
          deck_id?: string
          easiness_factor?: number | null
          front?: string
          id?: string
          interval_days?: number | null
          last_reviewed_at?: string | null
          next_review_at?: string | null
          repetition_count?: number | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "flashcard_decks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flashcards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          metadata: Json | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          metadata?: Json | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          cgu_accepted_at: string | null
          cgu_version: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          has_seen_support_hint: boolean | null
          has_seen_video_tutorial: boolean | null
          id: string
          is_onboarding_complete: boolean | null
          last_name: string | null
          level: string | null
          liaison_code: string | null
          lifetime_tier: string | null
          main_exam_period: string | null
          marketing_emails_optin: boolean | null
          marketing_optin_at: string | null
          privacy_accepted_at: string | null
          privacy_version: string | null
          school: string | null
          selected_tier: string | null
          signed_up_via_invite: boolean | null
          study_domain: string | null
          study_subcategory: string | null
          trial_started_at: string | null
          updated_at: string | null
          weekly_revision_hours: number | null
        }
        Insert: {
          cgu_accepted_at?: string | null
          cgu_version?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          has_seen_support_hint?: boolean | null
          has_seen_video_tutorial?: boolean | null
          id: string
          is_onboarding_complete?: boolean | null
          last_name?: string | null
          level?: string | null
          liaison_code?: string | null
          lifetime_tier?: string | null
          main_exam_period?: string | null
          marketing_emails_optin?: boolean | null
          marketing_optin_at?: string | null
          privacy_accepted_at?: string | null
          privacy_version?: string | null
          school?: string | null
          selected_tier?: string | null
          signed_up_via_invite?: boolean | null
          study_domain?: string | null
          study_subcategory?: string | null
          trial_started_at?: string | null
          updated_at?: string | null
          weekly_revision_hours?: number | null
        }
        Update: {
          cgu_accepted_at?: string | null
          cgu_version?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          has_seen_support_hint?: boolean | null
          has_seen_video_tutorial?: boolean | null
          id?: string
          is_onboarding_complete?: boolean | null
          last_name?: string | null
          level?: string | null
          liaison_code?: string | null
          lifetime_tier?: string | null
          main_exam_period?: string | null
          marketing_emails_optin?: boolean | null
          marketing_optin_at?: string | null
          privacy_accepted_at?: string | null
          privacy_version?: string | null
          school?: string | null
          selected_tier?: string | null
          signed_up_via_invite?: boolean | null
          study_domain?: string | null
          study_subcategory?: string | null
          trial_started_at?: string | null
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
      school_expected_students: {
        Row: {
          class_id: string | null
          cohort_id: string | null
          created_at: string | null
          created_by: string | null
          email: string
          first_name: string | null
          id: string
          is_registered: boolean | null
          last_name: string | null
          registered_user_id: string | null
          school_id: string
        }
        Insert: {
          class_id?: string | null
          cohort_id?: string | null
          created_at?: string | null
          created_by?: string | null
          email: string
          first_name?: string | null
          id?: string
          is_registered?: boolean | null
          last_name?: string | null
          registered_user_id?: string | null
          school_id: string
        }
        Update: {
          class_id?: string | null
          cohort_id?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string
          first_name?: string | null
          id?: string
          is_registered?: boolean | null
          last_name?: string | null
          registered_user_id?: string | null
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_expected_students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_expected_students_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_expected_students_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_expected_students_registered_user_id_fkey"
            columns: ["registered_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_expected_students_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
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
      school_members: {
        Row: {
          class_id: string | null
          cohort_id: string | null
          created_at: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          is_active: boolean | null
          joined_at: string | null
          role: string
          school_id: string
          user_id: string
        }
        Insert: {
          class_id?: string | null
          cohort_id?: string | null
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          role: string
          school_id: string
          user_id: string
        }
        Update: {
          class_id?: string | null
          cohort_id?: string | null
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          role?: string
          school_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_members_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_members_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_members_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      school_subjects: {
        Row: {
          coefficient: number | null
          cohort_id: string | null
          created_at: string | null
          description: string | null
          exam_date: string | null
          id: string
          name: string
          school_id: string
          updated_at: string | null
        }
        Insert: {
          coefficient?: number | null
          cohort_id?: string | null
          created_at?: string | null
          description?: string | null
          exam_date?: string | null
          id?: string
          name: string
          school_id: string
          updated_at?: string | null
        }
        Update: {
          coefficient?: number | null
          cohort_id?: string | null
          created_at?: string | null
          description?: string | null
          exam_date?: string | null
          id?: string
          name?: string
          school_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "school_subjects_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_subjects_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          address: string | null
          annual_price_cents: number | null
          city: string | null
          contact_email: string
          contact_phone: string | null
          country: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          postal_code: string | null
          primary_color: string | null
          school_type: string | null
          student_count_estimate: string | null
          subscription_end_date: string | null
          subscription_start_date: string | null
          subscription_tier: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          annual_price_cents?: number | null
          city?: string | null
          contact_email: string
          contact_phone?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          postal_code?: string | null
          primary_color?: string | null
          school_type?: string | null
          student_count_estimate?: string | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          annual_price_cents?: number | null
          city?: string | null
          contact_email?: string
          contact_phone?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          postal_code?: string | null
          primary_color?: string | null
          school_type?: string | null
          student_count_estimate?: string | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      session_files: {
        Row: {
          created_at: string
          event_id: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          session_id: string | null
          subject_name: string | null
          user_id: string
          valid_from: string
        }
        Insert: {
          created_at?: string
          event_id?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          session_id?: string | null
          subject_name?: string | null
          user_id: string
          valid_from?: string
        }
        Update: {
          created_at?: string
          event_id?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          session_id?: string | null
          subject_name?: string | null
          user_id?: string
          valid_from?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_files_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_files_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "revision_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_invites: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          confirmed: boolean | null
          created_at: string | null
          expires_at: string
          id: string
          invited_by: string
          meeting_address: string | null
          meeting_format: string | null
          meeting_link: string | null
          session_id: string
          unique_token: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          confirmed?: boolean | null
          created_at?: string | null
          expires_at: string
          id?: string
          invited_by: string
          meeting_address?: string | null
          meeting_format?: string | null
          meeting_link?: string | null
          session_id: string
          unique_token?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          confirmed?: boolean | null
          created_at?: string | null
          expires_at?: string
          id?: string
          invited_by?: string
          meeting_address?: string | null
          meeting_format?: string | null
          meeting_link?: string | null
          session_id?: string
          unique_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_invites_accepted_by_fkey"
            columns: ["accepted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_invites_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "revision_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_links: {
        Row: {
          created_at: string
          event_id: string | null
          id: string
          session_id: string | null
          subject_name: string | null
          title: string | null
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id?: string | null
          id?: string
          session_id?: string | null
          subject_name?: string | null
          title?: string | null
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string | null
          id?: string
          session_id?: string | null
          subject_name?: string | null
          title?: string | null
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_links_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_links_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "revision_sessions"
            referencedColumns: ["id"]
          },
        ]
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
      study_files: {
        Row: {
          created_at: string
          file_size: number
          file_type: string
          filename: string
          folder_name: string | null
          id: string
          storage_path: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_size: number
          file_type: string
          filename: string
          folder_name?: string | null
          id?: string
          storage_path: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_size?: number
          file_type?: string
          filename?: string
          folder_name?: string | null
          id?: string
          storage_path?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subjects: {
        Row: {
          color: string | null
          created_at: string | null
          difficulty_level: string | null
          exam_date: string | null
          exam_type: string | null
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
          exam_type?: string | null
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
          exam_type?: string | null
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
      tasks: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          position: number
          priority: string | null
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
          id?: string
          position?: number
          priority?: string | null
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
          id?: string
          position?: number
          priority?: string | null
          status?: string
          subject_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
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
          event_type_colors: Json | null
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
          event_type_colors?: Json | null
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
          event_type_colors?: Json | null
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
      generate_liaison_code: {
        Args: { p_email: string; p_first_name: string }
        Returns: string
      }
      get_school_role: {
        Args: { _school_id: string; _user_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_school_admin: {
        Args: { _school_id: string; _user_id: string }
        Returns: boolean
      }
      is_school_member: {
        Args: { _school_id: string; _user_id: string }
        Returns: boolean
      }
      use_access_code: {
        Args: { p_code: string; p_user_id: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "user" | "teacher"
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
      app_role: ["admin", "user", "teacher"],
    },
  },
} as const
