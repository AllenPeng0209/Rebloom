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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      album_comments: {
        Row: {
          album_id: string
          content: string
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          album_id: string
          content: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          album_id?: string
          content?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "album_comments_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "family_albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "album_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      album_likes: {
        Row: {
          album_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          album_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          album_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "album_likes_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "family_albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "album_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      album_photos: {
        Row: {
          album_id: string
          caption: string | null
          created_at: string
          id: string
          image_url: string
          metadata: Json | null
          order_index: number | null
        }
        Insert: {
          album_id: string
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          metadata?: Json | null
          order_index?: number | null
        }
        Update: {
          album_id?: string
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          metadata?: Json | null
          order_index?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "album_photos_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "family_albums"
            referencedColumns: ["id"]
          },
        ]
      }
      apple_tokens: {
        Row: {
          created_at: string
          refresh_token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          refresh_token: string
          user_id: string
        }
        Update: {
          created_at?: string
          refresh_token?: string
          user_id?: string
        }
        Relationships: []
      }
      chore_completions: {
        Row: {
          completed_by: string
          completion_time: string | null
          id: string
          notes: string | null
          photo_urls: string[] | null
          points_earned: number | null
          quality_rating: number | null
          task_id: string
          time_taken: number | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          completed_by: string
          completion_time?: string | null
          id?: string
          notes?: string | null
          photo_urls?: string[] | null
          points_earned?: number | null
          quality_rating?: number | null
          task_id: string
          time_taken?: number | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          completed_by?: string
          completion_time?: string | null
          id?: string
          notes?: string | null
          photo_urls?: string[] | null
          points_earned?: number | null
          quality_rating?: number | null
          task_id?: string
          time_taken?: number | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chore_completions_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chore_completions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "chore_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chore_completions_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      chore_points: {
        Row: {
          created_at: string | null
          current_balance: number | null
          description: string | null
          id: string
          member_id: string
          points_earned: number | null
          points_spent: number | null
          related_task_id: string | null
          transaction_type: string | null
        }
        Insert: {
          created_at?: string | null
          current_balance?: number | null
          description?: string | null
          id?: string
          member_id: string
          points_earned?: number | null
          points_spent?: number | null
          related_task_id?: string | null
          transaction_type?: string | null
        }
        Update: {
          created_at?: string | null
          current_balance?: number | null
          description?: string | null
          id?: string
          member_id?: string
          points_earned?: number | null
          points_spent?: number | null
          related_task_id?: string | null
          transaction_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chore_points_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chore_points_related_task_id_fkey"
            columns: ["related_task_id"]
            isOneToOne: false
            referencedRelation: "chore_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      chore_reward_redemptions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          fulfilled_at: string | null
          id: string
          member_id: string
          notes: string | null
          points_spent: number
          reward_id: string
          status: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          fulfilled_at?: string | null
          id?: string
          member_id: string
          notes?: string | null
          points_spent: number
          reward_id: string
          status?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          fulfilled_at?: string | null
          id?: string
          member_id?: string
          notes?: string | null
          points_spent?: number
          reward_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chore_reward_redemptions_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chore_reward_redemptions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chore_reward_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "chore_rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      chore_rewards: {
        Row: {
          age_restriction: number | null
          category: string | null
          created_at: string | null
          created_by: string
          description: string | null
          family_id: string
          id: string
          is_active: boolean | null
          max_redemptions_per_week: number | null
          name: string
          points_cost: number
        }
        Insert: {
          age_restriction?: number | null
          category?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          family_id: string
          id?: string
          is_active?: boolean | null
          max_redemptions_per_week?: number | null
          name: string
          points_cost: number
        }
        Update: {
          age_restriction?: number | null
          category?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          family_id?: string
          id?: string
          is_active?: boolean | null
          max_redemptions_per_week?: number | null
          name?: string
          points_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "chore_rewards_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chore_rewards_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      chore_skills: {
        Row: {
          category: string
          experience_points: number | null
          id: string
          last_updated: string | null
          member_id: string
          skill_level: number | null
        }
        Insert: {
          category: string
          experience_points?: number | null
          id?: string
          last_updated?: string | null
          member_id: string
          skill_level?: number | null
        }
        Update: {
          category?: string
          experience_points?: number | null
          id?: string
          last_updated?: string | null
          member_id?: string
          skill_level?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chore_skills_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      chore_tasks: {
        Row: {
          actual_duration: number | null
          assigned_to: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          created_by: string
          description: string | null
          due_date: string | null
          due_time: string | null
          estimated_duration: number | null
          family_id: string
          id: string
          points_reward: number | null
          priority: string | null
          status: string | null
          template_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_duration?: number | null
          assigned_to?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          estimated_duration?: number | null
          family_id: string
          id?: string
          points_reward?: number | null
          priority?: string | null
          status?: string | null
          template_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_duration?: number | null
          assigned_to?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          estimated_duration?: number | null
          family_id?: string
          id?: string
          points_reward?: number | null
          priority?: string | null
          status?: string | null
          template_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chore_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chore_tasks_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chore_tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chore_tasks_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chore_tasks_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "chore_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      chore_templates: {
        Row: {
          age_restriction: number | null
          category: string
          created_at: string | null
          created_by: string
          description: string | null
          difficulty_level: number | null
          estimated_duration: number | null
          family_id: string
          id: string
          instructions: string | null
          is_active: boolean | null
          name: string
          points_reward: number | null
          required_tools: string[] | null
          safety_notes: string | null
          updated_at: string | null
        }
        Insert: {
          age_restriction?: number | null
          category: string
          created_at?: string | null
          created_by: string
          description?: string | null
          difficulty_level?: number | null
          estimated_duration?: number | null
          family_id: string
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          name: string
          points_reward?: number | null
          required_tools?: string[] | null
          safety_notes?: string | null
          updated_at?: string | null
        }
        Update: {
          age_restriction?: number | null
          category?: string
          created_at?: string | null
          created_by?: string
          description?: string | null
          difficulty_level?: number | null
          estimated_duration?: number | null
          family_id?: string
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          name?: string
          points_reward?: number | null
          required_tools?: string[] | null
          safety_notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chore_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chore_templates_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_shares: {
        Row: {
          conversation_id: string
          created_at: string
          family_id: string
          id: string
          shared_by: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          family_id: string
          id?: string
          shared_by: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          family_id?: string
          id?: string
          shared_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_shares_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_shares_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_shares_shared_by_fkey"
            columns: ["shared_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          content: Json
          created_at: string
          created_by: string
          id: string
        }
        Insert: {
          content: Json
          created_at?: string
          created_by: string
          id?: string
        }
        Update: {
          content?: Json
          created_at?: string
          created_by?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      event_attendees: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      event_comments: {
        Row: {
          content: string
          created_at: string | null
          event_id: string
          id: string
          parent_comment_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          event_id: string
          id?: string
          parent_comment_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          event_id?: string
          id?: string
          parent_comment_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_comments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "event_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      event_exceptions: {
        Row: {
          created_at: string | null
          exception_date: string
          exception_type: string
          id: string
          modified_event_id: string | null
          parent_event_id: string | null
        }
        Insert: {
          created_at?: string | null
          exception_date: string
          exception_type: string
          id?: string
          modified_event_id?: string | null
          parent_event_id?: string | null
        }
        Update: {
          created_at?: string | null
          exception_date?: string
          exception_type?: string
          id?: string
          modified_event_id?: string | null
          parent_event_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_exceptions_modified_event_id_fkey"
            columns: ["modified_event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_exceptions_parent_event_id_fkey"
            columns: ["parent_event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_shares: {
        Row: {
          created_at: string | null
          event_id: string
          family_id: string
          id: string
          shared_by: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          family_id: string
          id?: string
          shared_by: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          family_id?: string
          id?: string
          shared_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_shares_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_shares_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_shares_shared_by_fkey"
            columns: ["shared_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      event_tags: {
        Row: {
          event_id: string
          id: string
          tag_id: string
        }
        Insert: {
          event_id: string
          id?: string
          tag_id: string
        }
        Update: {
          event_id?: string
          id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_tags_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          color: string | null
          created_at: string | null
          creator_id: string
          description: string | null
          end_ts: number
          family_id: string | null
          id: string
          image_urls: string[] | null
          location: string | null
          parent_event_id: string | null
          recurrence_count: number | null
          recurrence_end_date: string | null
          recurrence_rule: string | null
          source: string | null
          start_ts: number
          title: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          creator_id: string
          description?: string | null
          end_ts: number
          family_id?: string | null
          id?: string
          image_urls?: string[] | null
          location?: string | null
          parent_event_id?: string | null
          recurrence_count?: number | null
          recurrence_end_date?: string | null
          recurrence_rule?: string | null
          source?: string | null
          start_ts: number
          title: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          creator_id?: string
          description?: string | null
          end_ts?: number
          family_id?: string | null
          id?: string
          image_urls?: string[] | null
          location?: string | null
          parent_event_id?: string | null
          recurrence_count?: number | null
          recurrence_end_date?: string | null
          recurrence_rule?: string | null
          source?: string | null
          start_ts?: number
          title?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_parent_event_id_fkey"
            columns: ["parent_event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          date: string
          description: string | null
          family_id: string | null
          id: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          date: string
          description?: string | null
          family_id?: string | null
          id?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          date?: string
          description?: string | null
          family_id?: string | null
          id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      families: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          description: string | null
          enabled_features: string[] | null
          id: string
          invite_code: string | null
          name: string
          owner_id: string
          settings: Json | null
          tag: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          description?: string | null
          enabled_features?: string[] | null
          id?: string
          invite_code?: string | null
          name: string
          owner_id: string
          settings?: Json | null
          tag?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          description?: string | null
          enabled_features?: string[] | null
          id?: string
          invite_code?: string | null
          name?: string
          owner_id?: string
          settings?: Json | null
          tag?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "families_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      family_albums: {
        Row: {
          cover_image_url: string | null
          created_at: string
          family_id: string
          id: string
          image_urls: string[] | null
          is_smart_generated: boolean | null
          name: string
          photo_count: number | null
          story: string | null
          tags: string[] | null
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          family_id: string
          id?: string
          image_urls?: string[] | null
          is_smart_generated?: boolean | null
          name: string
          photo_count?: number | null
          story?: string | null
          tags?: string[] | null
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          family_id?: string
          id?: string
          image_urls?: string[] | null
          is_smart_generated?: boolean | null
          name?: string
          photo_count?: number | null
          story?: string | null
          tags?: string[] | null
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_albums_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      family_chat_messages: {
        Row: {
          content: string
          created_at: string | null
          family_id: string
          id: string
          message_type: string
          metadata: Json | null
          reply_to_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          family_id: string
          id?: string
          message_type?: string
          metadata?: Json | null
          reply_to_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          family_id?: string
          id?: string
          message_type?: string
          metadata?: Json | null
          reply_to_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_chat_messages_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_chat_messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "family_chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      family_invitations: {
        Row: {
          created_at: string | null
          expires_at: string | null
          family_id: string
          id: string
          invited_email: string
          invited_user_id: string | null
          inviter_id: string
          message: string | null
          role: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          family_id: string
          id?: string
          invited_email: string
          invited_user_id?: string | null
          inviter_id: string
          message?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          family_id?: string
          id?: string
          invited_email?: string
          invited_user_id?: string | null
          inviter_id?: string
          message?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_invitations_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_invitations_invited_user_id_fkey"
            columns: ["invited_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_invitations_inviter_id_fkey"
            columns: ["inviter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      family_members: {
        Row: {
          family_id: string
          id: string
          joined_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          family_id: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          family_id?: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_members_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      family_memories: {
        Row: {
          ai_generated_image_urls: Json | null
          comments_count: number | null
          created_at: string
          family_id: string
          id: string
          image_urls: Json | null
          is_featured: boolean | null
          likes_count: number | null
          location: string | null
          story: string | null
          tags: Json | null
          user_id: string
          views_count: number | null
          visibility: string | null
        }
        Insert: {
          ai_generated_image_urls?: Json | null
          comments_count?: number | null
          created_at?: string
          family_id: string
          id?: string
          image_urls?: Json | null
          is_featured?: boolean | null
          likes_count?: number | null
          location?: string | null
          story?: string | null
          tags?: Json | null
          user_id: string
          views_count?: number | null
          visibility?: string | null
        }
        Update: {
          ai_generated_image_urls?: Json | null
          comments_count?: number | null
          created_at?: string
          family_id?: string
          id?: string
          image_urls?: Json | null
          is_featured?: boolean | null
          likes_count?: number | null
          location?: string | null
          story?: string | null
          tags?: Json | null
          user_id?: string
          views_count?: number | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_memories_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      family_notifications: {
        Row: {
          created_at: string | null
          family_id: string
          id: string
          is_read: boolean | null
          is_sent: boolean | null
          message: string
          metadata: Json | null
          push_notification_id: string | null
          push_notification_sent: boolean | null
          read_at: string | null
          recipient_id: string
          related_id: string | null
          related_type: string | null
          sender_id: string
          sent_at: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          family_id: string
          id?: string
          is_read?: boolean | null
          is_sent?: boolean | null
          message: string
          metadata?: Json | null
          push_notification_id?: string | null
          push_notification_sent?: boolean | null
          read_at?: string | null
          recipient_id: string
          related_id?: string | null
          related_type?: string | null
          sender_id: string
          sent_at?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string | null
          family_id?: string
          id?: string
          is_read?: boolean | null
          is_sent?: boolean | null
          message?: string
          metadata?: Json | null
          push_notification_id?: string | null
          push_notification_sent?: boolean | null
          read_at?: string | null
          recipient_id?: string
          related_id?: string | null
          related_type?: string | null
          sender_id?: string
          sent_at?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_notifications_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_notifications_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      family_order_preferences: {
        Row: {
          created_at: string | null
          family_order: Json
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          family_order?: Json
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          family_order?: Json
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_order_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_accounts: {
        Row: {
          account_number: string | null
          balance: number | null
          bank_name: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          family_id: string
          id: string
          is_active: boolean | null
          name: string
          type: string
          updated_at: string | null
        }
        Insert: {
          account_number?: string | null
          balance?: number | null
          bank_name?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          family_id: string
          id?: string
          is_active?: boolean | null
          name: string
          type: string
          updated_at?: string | null
        }
        Update: {
          account_number?: string | null
          balance?: number | null
          bank_name?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          family_id?: string
          id?: string
          is_active?: boolean | null
          name?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "finance_accounts_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_budgets: {
        Row: {
          alert_threshold: number | null
          amount: number
          category_id: string | null
          created_at: string | null
          created_by: string
          end_date: string | null
          family_id: string
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          period: string
          spent_amount: number | null
          start_date: string
          updated_at: string | null
        }
        Insert: {
          alert_threshold?: number | null
          amount: number
          category_id?: string | null
          created_at?: string | null
          created_by: string
          end_date?: string | null
          family_id: string
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          period: string
          spent_amount?: number | null
          start_date: string
          updated_at?: string | null
        }
        Update: {
          alert_threshold?: number | null
          amount?: number
          category_id?: string | null
          created_at?: string | null
          created_by?: string
          end_date?: string | null
          family_id?: string
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          period?: string
          spent_amount?: number | null
          start_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "finance_budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "finance_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_budgets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_budgets_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_categories: {
        Row: {
          color: string | null
          created_at: string | null
          display_order: number | null
          family_id: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_system: boolean | null
          name: string
          parent_id: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          display_order?: number | null
          family_id?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name: string
          parent_id?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          display_order?: number | null
          family_id?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name?: string
          parent_id?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "finance_categories_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "finance_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_transactions: {
        Row: {
          account_id: string
          amount: number
          category_id: string
          created_at: string | null
          description: string | null
          family_id: string
          id: string
          is_recurring: boolean | null
          location: string | null
          member_id: string
          notes: string | null
          receipt_url: string | null
          recurring_pattern: Json | null
          reference_number: string | null
          status: string | null
          tags: string | null
          transaction_date: string
          type: string
          updated_at: string | null
        }
        Insert: {
          account_id: string
          amount: number
          category_id: string
          created_at?: string | null
          description?: string | null
          family_id: string
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          member_id: string
          notes?: string | null
          receipt_url?: string | null
          recurring_pattern?: Json | null
          reference_number?: string | null
          status?: string | null
          tags?: string | null
          transaction_date: string
          type: string
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          amount?: number
          category_id?: string
          created_at?: string | null
          description?: string | null
          family_id?: string
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          member_id?: string
          notes?: string | null
          receipt_url?: string | null
          recurring_pattern?: Json | null
          reference_number?: string | null
          status?: string | null
          tags?: string | null
          transaction_date?: string
          type?: string
          updated_at?: string | null
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
          {
            foreignKeyName: "finance_transactions_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_transactions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_transfers: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          exchange_rate: number | null
          fee: number | null
          from_account_id: string
          from_transaction_id: string | null
          id: string
          reference_number: string | null
          status: string | null
          to_account_id: string
          to_transaction_id: string | null
          transfer_date: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          exchange_rate?: number | null
          fee?: number | null
          from_account_id: string
          from_transaction_id?: string | null
          id?: string
          reference_number?: string | null
          status?: string | null
          to_account_id: string
          to_transaction_id?: string | null
          transfer_date: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          exchange_rate?: number | null
          fee?: number | null
          from_account_id?: string
          from_transaction_id?: string | null
          id?: string
          reference_number?: string | null
          status?: string | null
          to_account_id?: string
          to_transaction_id?: string | null
          transfer_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_transfers_from_account_id_fkey"
            columns: ["from_account_id"]
            isOneToOne: false
            referencedRelation: "finance_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_transfers_from_transaction_id_fkey"
            columns: ["from_transaction_id"]
            isOneToOne: false
            referencedRelation: "finance_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_transfers_to_account_id_fkey"
            columns: ["to_account_id"]
            isOneToOne: false
            referencedRelation: "finance_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_transfers_to_transaction_id_fkey"
            columns: ["to_transaction_id"]
            isOneToOne: false
            referencedRelation: "finance_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      health_alerts: {
        Row: {
          acknowledged_at: string | null
          alert_type: string
          created_at: string | null
          family_id: string | null
          id: string
          is_acknowledged: boolean | null
          is_resolved: boolean | null
          message: string
          related_record_id: string | null
          related_record_type: string | null
          resolved_at: string | null
          severity: string
          title: string
          user_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          alert_type: string
          created_at?: string | null
          family_id?: string | null
          id?: string
          is_acknowledged?: boolean | null
          is_resolved?: boolean | null
          message: string
          related_record_id?: string | null
          related_record_type?: string | null
          resolved_at?: string | null
          severity?: string
          title: string
          user_id: string
        }
        Update: {
          acknowledged_at?: string | null
          alert_type?: string
          created_at?: string | null
          family_id?: string | null
          id?: string
          is_acknowledged?: boolean | null
          is_resolved?: boolean | null
          message?: string
          related_record_id?: string | null
          related_record_type?: string | null
          resolved_at?: string | null
          severity?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_alerts_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      health_checkups: {
        Row: {
          blood_sugar: number | null
          bmi: number | null
          checkup_date: string
          checkup_type: string
          chest_xray: string | null
          created_at: string | null
          diagnosis: string | null
          diastolic_bp: number | null
          doctor_name: string | null
          ecg_result: string | null
          family_id: string | null
          follow_up_date: string | null
          follow_up_required: boolean | null
          hba1c: number | null
          hdl_cholesterol: number | null
          height: number | null
          id: string
          ldl_cholesterol: number | null
          medical_facility: string | null
          recommendations: string | null
          resting_heart_rate: number | null
          systolic_bp: number | null
          total_cholesterol: number | null
          triglycerides: number | null
          updated_at: string | null
          user_id: string
          weight: number | null
        }
        Insert: {
          blood_sugar?: number | null
          bmi?: number | null
          checkup_date: string
          checkup_type: string
          chest_xray?: string | null
          created_at?: string | null
          diagnosis?: string | null
          diastolic_bp?: number | null
          doctor_name?: string | null
          ecg_result?: string | null
          family_id?: string | null
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          hba1c?: number | null
          hdl_cholesterol?: number | null
          height?: number | null
          id?: string
          ldl_cholesterol?: number | null
          medical_facility?: string | null
          recommendations?: string | null
          resting_heart_rate?: number | null
          systolic_bp?: number | null
          total_cholesterol?: number | null
          triglycerides?: number | null
          updated_at?: string | null
          user_id: string
          weight?: number | null
        }
        Update: {
          blood_sugar?: number | null
          bmi?: number | null
          checkup_date?: string
          checkup_type?: string
          chest_xray?: string | null
          created_at?: string | null
          diagnosis?: string | null
          diastolic_bp?: number | null
          doctor_name?: string | null
          ecg_result?: string | null
          family_id?: string | null
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          hba1c?: number | null
          hdl_cholesterol?: number | null
          height?: number | null
          id?: string
          ldl_cholesterol?: number | null
          medical_facility?: string | null
          recommendations?: string | null
          resting_heart_rate?: number | null
          systolic_bp?: number | null
          total_cholesterol?: number | null
          triglycerides?: number | null
          updated_at?: string | null
          user_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "health_checkups_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      health_records: {
        Row: {
          created_at: string
          device_name: string | null
          diastolic_bp: number | null
          family_id: string | null
          id: string
          measurement_location: string | null
          measurement_time: string
          notes: string | null
          pulse: number | null
          record_type: string
          systolic_bp: number | null
          unit: string | null
          updated_at: string
          user_id: string
          value: number | null
        }
        Insert: {
          created_at?: string
          device_name?: string | null
          diastolic_bp?: number | null
          family_id?: string | null
          id?: string
          measurement_location?: string | null
          measurement_time?: string
          notes?: string | null
          pulse?: number | null
          record_type: string
          systolic_bp?: number | null
          unit?: string | null
          updated_at?: string
          user_id: string
          value?: number | null
        }
        Update: {
          created_at?: string
          device_name?: string | null
          diastolic_bp?: number | null
          family_id?: string | null
          id?: string
          measurement_location?: string | null
          measurement_time?: string
          notes?: string | null
          pulse?: number | null
          record_type?: string
          systolic_bp?: number | null
          unit?: string | null
          updated_at?: string
          user_id?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "health_records_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      japan_service_cache: {
        Row: {
          cache_key: string
          created_at: string | null
          expires_at: string
          id: string
          response_data: Json
          service_type: string
        }
        Insert: {
          cache_key: string
          created_at?: string | null
          expires_at: string
          id?: string
          response_data: Json
          service_type: string
        }
        Update: {
          cache_key?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          response_data?: Json
          service_type?: string
        }
        Relationships: []
      }
      medication_logs: {
        Row: {
          actual_time: string | null
          created_at: string
          id: string
          medication_id: string
          notes: string | null
          scheduled_time: string
          status: string
          user_id: string
        }
        Insert: {
          actual_time?: string | null
          created_at?: string
          id?: string
          medication_id: string
          notes?: string | null
          scheduled_time: string
          status?: string
          user_id: string
        }
        Update: {
          actual_time?: string | null
          created_at?: string
          id?: string
          medication_id?: string
          notes?: string | null
          scheduled_time?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medication_logs_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          created_at: string
          dosage: string
          end_date: string | null
          family_id: string | null
          frequency: string
          id: string
          is_active: boolean | null
          medication_name: string
          medication_type: string | null
          notes: string | null
          prescribed_by: string | null
          reminder_times: string[] | null
          start_date: string
          times_per_day: number | null
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dosage: string
          end_date?: string | null
          family_id?: string | null
          frequency: string
          id?: string
          is_active?: boolean | null
          medication_name: string
          medication_type?: string | null
          notes?: string | null
          prescribed_by?: string | null
          reminder_times?: string[] | null
          start_date: string
          times_per_day?: number | null
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dosage?: string
          end_date?: string | null
          family_id?: string | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          medication_name?: string
          medication_type?: string | null
          notes?: string | null
          prescribed_by?: string | null
          reminder_times?: string[] | null
          start_date?: string
          times_per_day?: number | null
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medications_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          memory_id: string
          parent_comment_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          memory_id: string
          parent_comment_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          memory_id?: string
          parent_comment_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memory_comments_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "family_memories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memory_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "memory_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memory_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_likes: {
        Row: {
          created_at: string | null
          id: string
          memory_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          memory_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          memory_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memory_likes_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "family_memories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memory_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_tags: {
        Row: {
          created_at: string | null
          created_by: string
          id: string
          memory_id: string
          tag_name: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          id?: string
          memory_id: string
          tag_name: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          id?: string
          memory_id?: string
          tag_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "memory_tags_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memory_tags_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "family_memories"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          event_created_enabled: boolean | null
          event_deleted_enabled: boolean | null
          event_reminder_enabled: boolean | null
          event_updated_enabled: boolean | null
          family_id: string | null
          family_invite_enabled: boolean | null
          id: string
          push_enabled: boolean | null
          push_token: string | null
          quiet_hours_enabled: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_created_enabled?: boolean | null
          event_deleted_enabled?: boolean | null
          event_reminder_enabled?: boolean | null
          event_updated_enabled?: boolean | null
          family_id?: string | null
          family_invite_enabled?: boolean | null
          id?: string
          push_enabled?: boolean | null
          push_token?: string | null
          quiet_hours_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_created_enabled?: boolean | null
          event_deleted_enabled?: boolean | null
          event_reminder_enabled?: boolean | null
          event_updated_enabled?: boolean | null
          family_id?: string | null
          family_invite_enabled?: boolean | null
          id?: string
          push_enabled?: boolean | null
          push_token?: string | null
          quiet_hours_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_budgets: {
        Row: {
          alert_threshold: number | null
          budget_month: string
          category: string
          created_at: string | null
          created_by: string
          family_id: string
          id: string
          is_active: boolean | null
          monthly_budget: number
          spent_amount: number | null
          updated_at: string | null
        }
        Insert: {
          alert_threshold?: number | null
          budget_month: string
          category: string
          created_at?: string | null
          created_by: string
          family_id: string
          id?: string
          is_active?: boolean | null
          monthly_budget: number
          spent_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          alert_threshold?: number | null
          budget_month?: string
          category?: string
          created_at?: string | null
          created_by?: string
          family_id?: string
          id?: string
          is_active?: boolean | null
          monthly_budget?: number
          spent_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shopping_budgets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_budgets_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_deals: {
        Row: {
          created_at: string | null
          created_by: string
          deal_price: number
          deal_type: string | null
          description: string | null
          discount_percentage: number | null
          end_date: string | null
          family_id: string
          id: string
          is_active: boolean | null
          item_name: string
          original_price: number | null
          start_date: string | null
          store_id: string | null
          terms_conditions: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          deal_price: number
          deal_type?: string | null
          description?: string | null
          discount_percentage?: number | null
          end_date?: string | null
          family_id: string
          id?: string
          is_active?: boolean | null
          item_name: string
          original_price?: number | null
          start_date?: string | null
          store_id?: string | null
          terms_conditions?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          deal_price?: number
          deal_type?: string | null
          description?: string | null
          discount_percentage?: number | null
          end_date?: string | null
          family_id?: string
          id?: string
          is_active?: boolean | null
          item_name?: string
          original_price?: number | null
          start_date?: string | null
          store_id?: string | null
          terms_conditions?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shopping_deals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_deals_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_deals_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "shopping_stores"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_items: {
        Row: {
          actual_price: number | null
          brand: string | null
          category: string | null
          created_at: string | null
          created_by: string
          estimated_price: number | null
          family_id: string
          id: string
          name: string
          notes: string | null
          priority: string | null
          purchased_at: string | null
          purchased_by: string | null
          quantity: number | null
          status: string | null
          store_preference: string | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          actual_price?: number | null
          brand?: string | null
          category?: string | null
          created_at?: string | null
          created_by: string
          estimated_price?: number | null
          family_id: string
          id?: string
          name: string
          notes?: string | null
          priority?: string | null
          purchased_at?: string | null
          purchased_by?: string | null
          quantity?: number | null
          status?: string | null
          store_preference?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_price?: number | null
          brand?: string | null
          category?: string | null
          created_at?: string | null
          created_by?: string
          estimated_price?: number | null
          family_id?: string
          id?: string
          name?: string
          notes?: string | null
          priority?: string | null
          purchased_at?: string | null
          purchased_by?: string | null
          quantity?: number | null
          status?: string | null
          store_preference?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shopping_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_items_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_items_purchased_by_fkey"
            columns: ["purchased_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_stores: {
        Row: {
          address: string | null
          category: string | null
          created_at: string | null
          family_id: string
          id: string
          is_favorite: boolean | null
          name: string
          notes: string | null
          opening_hours: Json | null
          phone: string | null
          rating: number | null
          website: string | null
        }
        Insert: {
          address?: string | null
          category?: string | null
          created_at?: string | null
          family_id: string
          id?: string
          is_favorite?: boolean | null
          name: string
          notes?: string | null
          opening_hours?: Json | null
          phone?: string | null
          rating?: number | null
          website?: string | null
        }
        Update: {
          address?: string | null
          category?: string | null
          created_at?: string | null
          family_id?: string
          id?: string
          is_favorite?: boolean | null
          name?: string
          notes?: string | null
          opening_hours?: Json | null
          phone?: string | null
          rating?: number | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shopping_stores_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          color: string
          created_at: string | null
          family_id: string
          id: string
          name: string
        }
        Insert: {
          color?: string
          created_at?: string | null
          family_id: string
          id?: string
          name: string
        }
        Update: {
          color?: string
          created_at?: string | null
          family_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "tags_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      todo_shares: {
        Row: {
          created_at: string | null
          family_id: string | null
          id: string
          shared_by: string | null
          todo_id: string | null
        }
        Insert: {
          created_at?: string | null
          family_id?: string | null
          id?: string
          shared_by?: string | null
          todo_id?: string | null
        }
        Update: {
          created_at?: string | null
          family_id?: string | null
          id?: string
          shared_by?: string | null
          todo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "todo_shares_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "todo_shares_shared_by_fkey"
            columns: ["shared_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "todo_shares_todo_id_fkey"
            columns: ["todo_id"]
            isOneToOne: false
            referencedRelation: "todos"
            referencedColumns: ["id"]
          },
        ]
      }
      todos: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          family_id: string
          id: string
          priority: string
          sort_order: number | null
          status: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          family_id: string
          id?: string
          priority?: string
          sort_order?: number | null
          status?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          family_id?: string
          id?: string
          priority?: string
          sort_order?: number | null
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "todos_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "todos_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "todos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_behavior_summary: {
        Row: {
          event_data: Json
          event_type: string
          id: string
          timestamp: string | null
          user_id: string
        }
        Insert: {
          event_data: Json
          event_type: string
          id?: string
          timestamp?: string | null
          user_id: string
        }
        Update: {
          event_data?: Json
          event_type?: string
          id?: string
          timestamp?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          birth_date: string | null
          created_at: string | null
          display_name: string
          email: string
          gender: string | null
          id: string
          interests: string | null
          is_premium: boolean
          is_trial_active: boolean
          language_preference: string | null
          original_transaction_id: string | null
          phone: string | null
          subscription_expires_at: string | null
          subscription_type: string | null
          trial_end_date: string | null
          trial_used: boolean
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string | null
          display_name: string
          email: string
          gender?: string | null
          id: string
          interests?: string | null
          is_premium?: boolean
          is_trial_active?: boolean
          language_preference?: string | null
          original_transaction_id?: string | null
          phone?: string | null
          subscription_expires_at?: string | null
          subscription_type?: string | null
          trial_end_date?: string | null
          trial_used?: boolean
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string | null
          display_name?: string
          email?: string
          gender?: string | null
          id?: string
          interests?: string | null
          is_premium?: boolean
          is_trial_active?: boolean
          language_preference?: string | null
          original_transaction_id?: string | null
          phone?: string | null
          subscription_expires_at?: string | null
          subscription_type?: string | null
          trial_end_date?: string | null
          trial_used?: boolean
          updated_at?: string | null
        }
        Relationships: []
      }
      videos: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          duration: number | null
          family_id: string
          generation_settings: Json | null
          id: string
          processing_log: string | null
          source_images: string[] | null
          status: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          duration?: number | null
          family_id: string
          generation_settings?: Json | null
          id?: string
          processing_log?: string | null
          source_images?: string[] | null
          status?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          duration?: number | null
          family_id?: string
          generation_settings?: Json | null
          id?: string
          processing_log?: string | null
          source_images?: string[] | null
          status?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "videos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "videos_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      activate_subscription: {
        Args: {
          expires_at: string
          sub_type: string
          transaction_id: string
          user_id: string
        }
        Returns: boolean
      }
      cancel_subscription: {
        Args: { user_id: string }
        Returns: boolean
      }
      cleanup_expired_cache: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      debug_event_comments_permissions: {
        Args: { p_event_id: string; p_user_id: string }
        Returns: {
          details: Json
          has_permission: boolean
          permission_type: string
        }[]
      }
      get_user_family_ids: {
        Args: { user_uuid: string }
        Returns: {
          family_id: string
        }[]
      }
      get_user_subscription_status: {
        Args: { user_id: string }
        Returns: Json
      }
      insert_recommendation_history: {
        Args: { records: Json }
        Returns: undefined
      }
      is_user_premium: {
        Args: { user_id: string }
        Returns: boolean
      }
      start_user_trial: {
        Args: { trial_days?: number; user_id: string }
        Returns: boolean
      }
      update_expired_subscriptions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_recommendation_feedback: {
        Args: {
          feedback_data: Json
          recommendation_id: string
          user_id: string
        }
        Returns: undefined
      }
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
    Enums: {},
  },
} as const