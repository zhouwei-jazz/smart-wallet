// ============================================
// Smart Wallet Mobile - Supabase 初始化
// ============================================

import { initSupabaseClient } from '@smart-wallet/core';
import { supabase } from './supabase';

// 初始化 Supabase 客户端
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

// 初始化核心包的 Supabase 客户端
initSupabaseClient({
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
});

console.log('✅ Supabase client initialized for mobile app');