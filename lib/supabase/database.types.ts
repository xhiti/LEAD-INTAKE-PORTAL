export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          surname: string
          initials: string
          full_name: string
          email: string
          phone: string | null
          gender: 'male' | 'female' | 'non_binary' | 'prefer_not_to_say' | null
          role: 'user' | 'admin' | 'moderator' | 'viewer'
          avatar_url: string | null
          locale: string
          theme: 'light' | 'dark' | 'system'
          last_login: string | null
          email_verified: boolean
          phone_verified: boolean
          onboarding_completed: boolean
          bio: string | null
          company: string | null
          job_title: string | null
          timezone: string
          is_active: boolean
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          surname: string
          email: string
          phone?: string | null
          gender?: 'male' | 'female' | 'non_binary' | 'prefer_not_to_say' | null
          role?: 'user' | 'admin' | 'moderator' | 'viewer'
          avatar_url?: string | null
          locale?: string
          theme?: 'light' | 'dark' | 'system'
          bio?: string | null
          company?: string | null
          job_title?: string | null
          timezone?: string
        }
        Update: {
          name?: string
          surname?: string
          email?: string
          phone?: string | null
          gender?: 'male' | 'female' | 'non_binary' | 'prefer_not_to_say' | null
          role?: 'user' | 'admin' | 'moderator' | 'viewer'
          avatar_url?: string | null
          locale?: string
          theme?: 'light' | 'dark' | 'system'
          last_login?: string | null
          bio?: string | null
          company?: string | null
          job_title?: string | null
          timezone?: string
          onboarding_completed?: boolean
          is_active?: boolean
          is_deleted?: boolean
        }
        Relationships: []
      }
      auth_sessions: {
        Row: {
          id: string
          user_id: string
          session_token: string | null
          ip_address: string | null
          user_agent: string | null
          device_type: 'desktop' | 'mobile' | 'tablet' | 'unknown' | null
          browser: string | null
          os: string | null
          country: string | null
          city: string | null
          provider: 'email' | 'google' | 'github'
          is_active: boolean
          is_deleted: boolean
          logged_in_at: string
          logged_out_at: string | null
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          session_token?: string | null
          ip_address?: string | null
          user_agent?: string | null
          device_type?: 'desktop' | 'mobile' | 'tablet' | 'unknown' | null
          browser?: string | null
          os?: string | null
          country?: string | null
          city?: string | null
          provider?: 'email' | 'google' | 'github'
          expires_at?: string | null
        }
        Update: {
          is_active?: boolean
          logged_out_at?: string | null
        }
        Relationships: []
      }
      submissions: {
        Row: {
          id: string
          submitted_by: string | null
          name: string
          email: string
          business_name: string
          industry: string
          help_request: string
          ai_summary: string | null
          ai_category: string | null
          ai_confidence_score: number | null
          ai_model_used: string | null
          ai_processed_at: string | null
          ai_raw_response: Json | null
          status: 'new' | 'reviewed' | 'in_progress' | 'closed' | 'archived'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          notes: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          is_active: boolean
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          submitted_by?: string | null
          name: string
          email: string
          business_name: string
          industry: string
          help_request: string
          ai_summary?: string | null
          ai_category?: string | null
          ai_confidence_score?: number | null
          ai_model_used?: string | null
          ai_processed_at?: string | null
          ai_raw_response?: Json | null
          status?: 'new' | 'reviewed' | 'in_progress' | 'closed' | 'archived'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          notes?: string | null
        }
        Update: {
          status?: 'new' | 'reviewed' | 'in_progress' | 'closed' | 'archived'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          notes?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          ai_summary?: string | null
          ai_category?: string | null
          is_active?: boolean
          is_deleted?: boolean
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'new_submission' | 'submission_reviewed' | 'submission_status_changed' | 'system_alert' | 'account_update' | 'welcome' | 'role_changed' | 'mention'
          title: string
          body: string
          data: Json
          action_url: string | null
          is_read: boolean
          read_at: string | null
          channel: 'in_app' | 'web_push' | 'email'
          is_active: boolean
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          type: 'new_submission' | 'submission_reviewed' | 'submission_status_changed' | 'system_alert' | 'account_update' | 'welcome' | 'role_changed' | 'mention'
          title: string
          body: string
          data?: Json
          action_url?: string | null
          channel?: 'in_app' | 'web_push' | 'email'
        }
        Update: {
          is_read?: boolean
          read_at?: string | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          id: string
          user_id: string
          in_app_new_submission: boolean
          in_app_status_changes: boolean
          in_app_system_alerts: boolean
          in_app_account_updates: boolean
          push_enabled: boolean
          push_subscription: Json | null
          push_new_submission: boolean
          push_status_changes: boolean
          push_system_alerts: boolean
          email_new_submission: boolean
          email_status_changes: boolean
          email_weekly_digest: boolean
          dnd_enabled: boolean
          dnd_start_time: string | null
          dnd_end_time: string | null
          is_active: boolean
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          in_app_new_submission?: boolean
          in_app_status_changes?: boolean
          in_app_system_alerts?: boolean
          in_app_account_updates?: boolean
          push_enabled?: boolean
          push_subscription?: Json | null
        }
        Update: {
          in_app_new_submission?: boolean
          in_app_status_changes?: boolean
          in_app_system_alerts?: boolean
          in_app_account_updates?: boolean
          push_enabled?: boolean
          push_subscription?: Json | null
          push_new_submission?: boolean
          push_status_changes?: boolean
          push_system_alerts?: boolean
          email_new_submission?: boolean
          email_status_changes?: boolean
          email_weekly_digest?: boolean
          dnd_enabled?: boolean
          dnd_start_time?: string | null
          dnd_end_time?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          old_data: Json | null
          new_data: Json | null
          metadata: Json
          ip_address: string | null
          user_agent: string | null
          is_active: boolean
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          old_data?: Json | null
          new_data?: Json | null
          metadata?: Json
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: Record<string, never>
        Relationships: []
      }
      industries: {
        Row: {
          id: string
          code: string
          title: string
          description: string | null
          order_index: number
          is_active: boolean
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          title: string
          description?: string | null
          order_index?: number
          is_active?: boolean
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          title?: string
          description?: string | null
          order_index?: number
          is_active?: boolean
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      get_dashboard_stats: {
        Args: Record<string, never>
        Returns: Json
      }
      get_unread_notification_count: {
        Args: { p_user_id: string }
        Returns: number
      }
      mark_all_notifications_read: {
        Args: { p_user_id: string }
        Returns: void
      }
    }
    Enums: Record<string, never>
  }
}
