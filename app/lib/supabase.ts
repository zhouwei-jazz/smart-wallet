import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

// 创建一个安全的存储适配器
const createSafeStorage = () => {
  // 在Web环境下，检查是否有window对象
  if (Platform.OS === 'web' && typeof window === 'undefined') {
    // 服务端渲染时返回一个空的存储适配器
    return {
      getItem: async () => null,
      setItem: async () => {},
      removeItem: async () => {},
    }
  }
  return AsyncStorage
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: createSafeStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// 数据库类型定义（与 Web 端保持一致）
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