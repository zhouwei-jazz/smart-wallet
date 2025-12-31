'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClientSupabaseClient } from '@/lib/supabase'
import { initSupabaseClient } from '@smart-wallet/core'
import { User, Session } from '@supabase/supabase-js'

interface SupabaseContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const SupabaseContext = createContext<SupabaseContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
})

export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [coreInitialized, setCoreInitialized] = useState(false)
  
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    // 初始化核心包的 Supabase 客户端
    if (!coreInitialized) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseAnonKey) {
        try {
          initSupabaseClient({
            url: supabaseUrl,
            anonKey: supabaseAnonKey,
          });
          console.log('✅ Supabase client initialized for web app');
          setCoreInitialized(true);
        } catch (error) {
          console.error('Failed to initialize Supabase client:', error);
        }
      }
    }

    // 获取初始会话
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth, coreInitialized])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = {
    user,
    session,
    loading,
    signOut,
  }

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  )
}