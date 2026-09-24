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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      advisor_messages: {
        Row: {
          created_at: string
          id: string
          parts: Json
          role: string
          thread_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          parts?: Json
          role: string
          thread_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          parts?: Json
          role?: string
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "advisor_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "advisor_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      advisor_threads: {
        Row: {
          created_at: string
          id: string
          is_shared: boolean
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_shared?: boolean
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_shared?: boolean
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      agreement_comments: {
        Row: {
          agreement_id: string
          content: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          agreement_id: string
          content: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          agreement_id?: string
          content?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agreement_comments_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: false
            referencedRelation: "couple_agreements"
            referencedColumns: ["id"]
          },
        ]
      }
      albums: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      challenge_completions: {
        Row: {
          challenge_id: string
          created_at: string
          day: string
          id: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          created_at?: string
          day?: string
          id?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          created_at?: string
          day?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_completions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          created_at: string
          description: string | null
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          expires_at: string
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          expires_at?: string
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          expires_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      couple_agreements: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          id: string
          review_date: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          review_date?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          review_date?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      couple_checkins: {
        Row: {
          created_at: string
          emotion: string
          energy_level: number
          id: string
          need: string | null
          note: string | null
          support_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emotion: string
          energy_level?: number
          id?: string
          need?: string | null
          note?: string | null
          support_type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          emotion?: string
          energy_level?: number
          id?: string
          need?: string | null
          note?: string | null
          support_type?: string
          user_id?: string
        }
        Relationships: []
      }
      couple_goals: {
        Row: {
          created_at: string
          currency: string
          deadline: string | null
          description: string | null
          emoji: string
          id: string
          is_completed: boolean
          target_amount: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          deadline?: string | null
          description?: string | null
          emoji?: string
          id?: string
          is_completed?: boolean
          target_amount?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          deadline?: string | null
          description?: string | null
          emoji?: string
          id?: string
          is_completed?: boolean
          target_amount?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      couple_members: {
        Row: {
          couple_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          couple_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          couple_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "couple_members_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_plans: {
        Row: {
          budget: string
          created_at: string
          description: string | null
          id: string
          location_type: string
          mood: string
          planned_date: string | null
          status: string
          time_available: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          budget?: string
          created_at?: string
          description?: string | null
          id?: string
          location_type?: string
          mood?: string
          planned_date?: string | null
          status?: string
          time_available?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          budget?: string
          created_at?: string
          description?: string | null
          id?: string
          location_type?: string
          mood?: string
          planned_date?: string | null
          status?: string
          time_available?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      couple_tasks: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string
          done_at: string | null
          done_by: string | null
          due_date: string | null
          id: string
          is_done: boolean
          repeat_rule: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          done_at?: string | null
          done_by?: string | null
          due_date?: string | null
          id?: string
          is_done?: boolean
          repeat_rule?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          done_at?: string | null
          done_by?: string | null
          due_date?: string | null
          id?: string
          is_done?: boolean
          repeat_rule?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      couples: {
        Row: {
          code: string
          created_at: string
          created_by: string
          id: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          created_by: string
          id?: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      coupon_redemptions: {
        Row: {
          coupon_id: string
          created_at: string
          id: string
          note: string | null
          user_id: string
        }
        Insert: {
          coupon_id: string
          created_at?: string
          id?: string
          note?: string | null
          user_id: string
        }
        Update: {
          coupon_id?: string
          created_at?: string
          id?: string
          note?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_redemptions_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          category: string
          created_at: string
          description: string | null
          emoji: string
          expires_at: string | null
          id: string
          title: string
          updated_at: string
          user_id: string
          uses_total: number
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          emoji?: string
          expires_at?: string | null
          id?: string
          title: string
          updated_at?: string
          user_id: string
          uses_total?: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          emoji?: string
          expires_at?: string | null
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
          uses_total?: number
        }
        Relationships: []
      }
      dedication_comments: {
        Row: {
          content: string
          created_at: string
          dedication_id: string
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          dedication_id: string
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          dedication_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dedication_comments_dedication_id_fkey"
            columns: ["dedication_id"]
            isOneToOne: false
            referencedRelation: "dedications"
            referencedColumns: ["id"]
          },
        ]
      }
      dedication_reactions: {
        Row: {
          created_at: string
          dedication_id: string
          id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dedication_id: string
          id?: string
          reaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          dedication_id?: string
          id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dedication_reactions_dedication_id_fkey"
            columns: ["dedication_id"]
            isOneToOne: false
            referencedRelation: "dedications"
            referencedColumns: ["id"]
          },
        ]
      }
      dedications: {
        Row: {
          content: string | null
          created_at: string
          file_path: string | null
          file_size: number | null
          file_type: string | null
          id: string
          is_archived: boolean
          is_favorite: boolean
          kind: string
          title: string
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_archived?: boolean
          is_favorite?: boolean
          kind: string
          title: string
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_archived?: boolean
          is_favorite?: boolean
          kind?: string
          title?: string
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      deep_questions: {
        Row: {
          category: string
          created_at: string
          id: string
          is_daily: boolean
          question: string
          user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          is_daily?: boolean
          question: string
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_daily?: boolean
          question?: string
          user_id?: string | null
        }
        Relationships: []
      }
      event_responses: {
        Row: {
          created_at: string
          event_id: string
          id: string
          response_status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          response_status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          response_status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_responses_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          category: string
          countdown_enabled: boolean
          created_at: string
          date: string
          description: string | null
          id: string
          is_recurring: boolean
          location: string | null
          recurrence_rule: string | null
          reminder_minutes: number | null
          time: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          countdown_enabled?: boolean
          created_at?: string
          date: string
          description?: string | null
          id?: string
          is_recurring?: boolean
          location?: string | null
          recurrence_rule?: string | null
          reminder_minutes?: number | null
          time?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          countdown_enabled?: boolean
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          is_recurring?: boolean
          location?: string | null
          recurrence_rule?: string | null
          reminder_minutes?: number | null
          time?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fun_comments: {
        Row: {
          content: string
          created_at: string
          fun_item_id: string
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          fun_item_id: string
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          fun_item_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fun_comments_fun_item_id_fkey"
            columns: ["fun_item_id"]
            isOneToOne: false
            referencedRelation: "fun_items"
            referencedColumns: ["id"]
          },
        ]
      }
      fun_items: {
        Row: {
          answer: string | null
          category: string
          content: string
          created_at: string
          id: string
          is_favorite: boolean
          options: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          answer?: string | null
          category?: string
          content: string
          created_at?: string
          id?: string
          is_favorite?: boolean
          options?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          answer?: string | null
          category?: string
          content?: string
          created_at?: string
          id?: string
          is_favorite?: boolean
          options?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fun_ratings: {
        Row: {
          created_at: string
          fun_item_id: string
          id: string
          score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          fun_item_id: string
          id?: string
          score: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          fun_item_id?: string
          id?: string
          score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fun_ratings_fun_item_id_fkey"
            columns: ["fun_item_id"]
            isOneToOne: false
            referencedRelation: "fun_items"
            referencedColumns: ["id"]
          },
        ]
      }
      fun_reactions: {
        Row: {
          created_at: string
          fun_item_id: string
          id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          fun_item_id: string
          id?: string
          reaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          fun_item_id?: string
          id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fun_reactions_fun_item_id_fkey"
            columns: ["fun_item_id"]
            isOneToOne: false
            referencedRelation: "fun_items"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_contributions: {
        Row: {
          amount: number
          created_at: string
          goal_id: string
          id: string
          note: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          goal_id: string
          id?: string
          note?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          goal_id?: string
          id?: string
          note?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_contributions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "couple_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      gratitudes: {
        Row: {
          content: string
          created_at: string
          id: string
          is_favorite: boolean
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_favorite?: boolean
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_favorite?: boolean
          user_id?: string
        }
        Relationships: []
      }
      milestones: {
        Row: {
          created_at: string
          date: string
          description: string | null
          id: string
          photo_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          description?: string | null
          id?: string
          photo_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          photo_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "photos"
            referencedColumns: ["id"]
          },
        ]
      }
      moods: {
        Row: {
          created_at: string
          emoji: string
          id: string
          label: string
          note: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          label: string
          note?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          label?: string
          note?: string | null
          user_id?: string
        }
        Relationships: []
      }
      note_attachments: {
        Row: {
          attachment_type: string
          created_at: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          note_id: string
          url: string | null
          user_id: string
        }
        Insert: {
          attachment_type?: string
          created_at?: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          note_id: string
          url?: string | null
          user_id: string
        }
        Update: {
          attachment_type?: string
          created_at?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          note_id?: string
          url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_attachments_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
        ]
      }
      note_reactions: {
        Row: {
          created_at: string
          id: string
          note_id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note_id: string
          reaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          note_id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_reactions_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
        ]
      }
      note_replies: {
        Row: {
          content: string
          created_at: string
          id: string
          note_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          note_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          note_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_replies_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          is_archived: boolean
          is_favorite: boolean
          scheduled_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          is_archived?: boolean
          is_favorite?: boolean
          scheduled_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          is_archived?: boolean
          is_favorite?: boolean
          scheduled_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      photo_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          photo_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          photo_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          photo_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "photo_comments_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "photos"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_reactions: {
        Row: {
          created_at: string
          id: string
          photo_id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          photo_id: string
          reaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          photo_id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "photo_reactions_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "photos"
            referencedColumns: ["id"]
          },
        ]
      }
      photos: {
        Row: {
          album_id: string | null
          caption: string | null
          created_at: string
          file_path: string
          file_size: number | null
          height: number | null
          id: string
          is_favorite: boolean
          tags: string[]
          taken_at: string | null
          user_id: string
          width: number | null
        }
        Insert: {
          album_id?: string | null
          caption?: string | null
          created_at?: string
          file_path: string
          file_size?: number | null
          height?: number | null
          id?: string
          is_favorite?: boolean
          tags?: string[]
          taken_at?: string | null
          user_id: string
          width?: number | null
        }
        Update: {
          album_id?: string | null
          caption?: string | null
          created_at?: string
          file_path?: string
          file_size?: number | null
          height?: number | null
          id?: string
          is_favorite?: boolean
          tags?: string[]
          taken_at?: string | null
          user_id?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "photos_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_votes: {
        Row: {
          created_at: string
          id: string
          plan_id: string
          user_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          plan_id: string
          user_id: string
          vote_type?: string
        }
        Update: {
          created_at?: string
          id?: string
          plan_id?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_votes_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "couple_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          anniversary_date: string | null
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          latitude: number | null
          location: string | null
          location_accuracy: number | null
          location_shares_until: string | null
          location_updated_at: string | null
          longitude: number | null
          name: string
          updated_at: string
        }
        Insert: {
          anniversary_date?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id: string
          latitude?: number | null
          location?: string | null
          location_accuracy?: number | null
          location_shares_until?: string | null
          location_updated_at?: string | null
          longitude?: number | null
          name?: string
          updated_at?: string
        }
        Update: {
          anniversary_date?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          latitude?: number | null
          location?: string | null
          location_accuracy?: number | null
          location_shares_until?: string | null
          location_updated_at?: string | null
          longitude?: number | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      push_tokens: {
        Row: {
          created_at: string
          id: string
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          token: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          token?: string
          user_id?: string
        }
        Relationships: []
      }
      question_responses: {
        Row: {
          answer: string
          created_at: string
          id: string
          is_favorite: boolean
          question_id: string
          user_id: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          is_favorite?: boolean
          question_id: string
          user_id: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          is_favorite?: boolean
          question_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "deep_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          author: string | null
          content: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          author?: string | null
          content: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          author?: string | null
          content?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      roulette_items: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          category?: string
          content: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          user_id: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          user_id: string
          value?: Json
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          user_id?: string
          value?: Json
        }
        Relationships: []
      }
      song_reactions: {
        Row: {
          created_at: string
          id: string
          reaction_type: string
          song_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reaction_type: string
          song_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reaction_type?: string
          song_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "song_reactions_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      songs: {
        Row: {
          artist: string | null
          created_at: string
          id: string
          is_favorite: boolean
          note: string | null
          title: string
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          artist?: string | null
          created_at?: string
          id?: string
          is_favorite?: boolean
          note?: string | null
          title: string
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          artist?: string | null
          created_at?: string
          id?: string
          is_favorite?: boolean
          note?: string | null
          title?: string
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      time_capsules: {
        Row: {
          content: string | null
          created_at: string
          file_path: string | null
          file_type: string | null
          id: string
          open_at: string
          opened_at: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          file_path?: string | null
          file_type?: string | null
          id?: string
          open_at: string
          opened_at?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          file_path?: string | null
          file_type?: string | null
          id?: string
          open_at?: string
          opened_at?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      video_comentarios: {
        Row: {
          contenido: string
          created_at: string
          id: string
          user_id: string
          video_id: string
        }
        Insert: {
          contenido: string
          created_at?: string
          id?: string
          user_id: string
          video_id: string
        }
        Update: {
          contenido?: string
          created_at?: string
          id?: string
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_comentarios_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos_diarios"
            referencedColumns: ["id"]
          },
        ]
      }
      videos_diarios: {
        Row: {
          created_at: string
          descripcion: string | null
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wish_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          user_id: string
          wish_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          user_id: string
          wish_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          user_id?: string
          wish_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wish_comments_wish_id_fkey"
            columns: ["wish_id"]
            isOneToOne: false
            referencedRelation: "wishes"
            referencedColumns: ["id"]
          },
        ]
      }
      wish_votes: {
        Row: {
          created_at: string
          id: string
          user_id: string
          vote_value: number
          wish_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          vote_value?: number
          wish_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          vote_value?: number
          wish_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wish_votes_wish_id_fkey"
            columns: ["wish_id"]
            isOneToOne: false
            referencedRelation: "wishes"
            referencedColumns: ["id"]
          },
        ]
      }
      wishes: {
        Row: {
          budget: number | null
          category: string
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          is_completed: boolean
          link: string | null
          priority: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          budget?: number | null
          category?: string
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          is_completed?: boolean
          link?: string | null
          priority?: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          budget?: number | null
          category?: string
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          is_completed?: boolean
          link?: string | null
          priority?: number
          title?: string
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
      my_couple_id: { Args: never; Returns: string }
      same_space: { Args: { _user: string }; Returns: boolean }
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
  public: {
    Enums: {},
  },
} as const
