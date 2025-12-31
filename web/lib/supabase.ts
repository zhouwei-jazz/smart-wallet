import { createClient } from '@supabase/supabase-js'

// 客户端 Supabase 实例
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// 服务端 Supabase 实例
export const createServerSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// 客户端组件 Supabase 实例
export const createClientSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// 数据库类型定义（从 Supabase 自动生成）
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
      accounts: {
        Row: {
          balance: number | null
          color: string | null
          created_at: string | null
          currency: string | null
          icon: string | null
          id: string
          institution: string | null
          is_default: boolean | null
          name: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          color?: string | null
          created_at?: string | null
          currency?: string | null
          icon?: string | null
          id?: string
          institution?: string | null
          is_default?: boolean | null
          name: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number | null
          color?: string | null
          created_at?: string | null
          currency?: string | null
          icon?: string | null
          id?: string
          institution?: string | null
          is_default?: boolean | null
          name?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
      }
      budgets: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string | null
          currency: string | null
          end_date: string | null
          id: string
          period: string
          spent: number | null
          start_date: string
          user_id: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string | null
          currency?: string | null
          end_date?: string | null
          id?: string
          period: string
          spent?: number | null
          start_date: string
          user_id: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string | null
          currency?: string | null
          end_date?: string | null
          id?: string
          period?: string
          spent?: number | null
          start_date?: string
          user_id?: string
        }
      }
      categories: {
        Row: {
          color: string | null
          created_at: string | null
          icon: string | null
          id: string
          is_system: boolean | null
          name: string
          parent_id: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_system?: boolean | null
          name: string
          parent_id?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_system?: boolean | null
          name?: string
          parent_id?: string | null
          type?: string
          user_id?: string | null
        }
      }
      transactions: {
        Row: {
          account_id: string
          amount: number
          category_id: string | null
          created_at: string | null
          date: string
          id: string
          image_url: string | null
          location: Json | null
          merchant: string | null
          note: string | null
          status: string | null
          tags: string[] | null
          time: string | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_id: string
          amount: number
          category_id?: string | null
          created_at?: string | null
          date?: string
          id?: string
          image_url?: string | null
          location?: Json | null
          merchant?: string | null
          note?: string | null
          status?: string | null
          tags?: string[] | null
          time?: string | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_id?: string
          amount?: number
          category_id?: string | null
          created_at?: string | null
          date?: string
          id?: string
          image_url?: string | null
          location?: Json | null
          merchant?: string | null
          note?: string | null
          status?: string | null
          tags?: string[] | null
          time?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          default_currency: string | null
          id: string
          name: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          default_currency?: string | null
          id: string
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          default_currency?: string | null
          id?: string
          name?: string | null
          updated_at?: string | null
        }
      }
    }
  }
}