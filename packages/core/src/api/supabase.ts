// ============================================
// Smart Wallet - Supabase API Client
// ============================================

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type {
  Account,
  Transaction,
  Category,
  Budget,
  User,
  CreateAccountInput,
  UpdateAccountInput,
  CreateTransactionInput,
  UpdateTransactionInput,
  CreateCategoryInput,
  CreateBudgetInput,
  TransactionFilters,
} from '../types';

// User types for authentication
export interface CreateUserInput {
  name: string;
  email: string;
  default_currency?: string;
}

// ============================================
// Client Configuration
// ============================================
let supabaseClient: SupabaseClient | null = null;

export function initSupabaseClient(config: {
  url: string;
  anonKey: string;
}) {
  supabaseClient = createClient(config.url, config.anonKey);
  return supabaseClient;
}

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    throw new Error('Supabase client not initialized. Call initSupabaseClient() first.');
  }
  return supabaseClient;
}

// ============================================
// Users API
// ============================================
export async function getUserByEmail(email: string): Promise<User | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('user_profiles')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows found
    throw error;
  }
  return data as User;
}

export async function getUserById(id: string): Promise<User | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('user_profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows found
    throw error;
  }
  return data as User;
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('user_profiles')
    .insert({
      ...input,
      default_currency: input.default_currency || 'CNY',
    })
    .select('id, name, default_currency, created_at, updated_at')
    .single();

  if (error) throw error;
  return data as User;
}

export async function createDefaultCategories(userId: string): Promise<void> {
  const client = getSupabaseClient();
  
  const defaultCategories = [
    // 支出分类
    { name: '餐饮', type: 'expense', icon: '🍽️', color: '#EF4444', user_id: userId },
    { name: '交通', type: 'expense', icon: '🚗', color: '#F59E0B', user_id: userId },
    { name: '购物', type: 'expense', icon: '🛍️', color: '#EC4899', user_id: userId },
    { name: '娱乐', type: 'expense', icon: '🎬', color: '#8B5CF6', user_id: userId },
    { name: '医疗', type: 'expense', icon: '🏥', color: '#06B6D4', user_id: userId },
    { name: '教育', type: 'expense', icon: '📚', color: '#10B981', user_id: userId },
    { name: '住房', type: 'expense', icon: '🏠', color: '#3B82F6', user_id: userId },
    { name: '其他', type: 'expense', icon: '📊', color: '#6B7280', user_id: userId },
    
    // 收入分类
    { name: '工资', type: 'income', icon: '💰', color: '#10B981', user_id: userId },
    { name: '奖金', type: 'income', icon: '🎁', color: '#F59E0B', user_id: userId },
    { name: '投资', type: 'income', icon: '📈', color: '#3B82F6', user_id: userId },
    { name: '其他收入', type: 'income', icon: '💵', color: '#6B7280', user_id: userId },
  ];

  const { error } = await client.from('categories').insert(defaultCategories);
  if (error) throw error;
}

// ============================================
// Accounts API
// ============================================
export async function getAccounts(): Promise<Account[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('accounts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Account[];
}

export async function getAccountById(id: string): Promise<Account> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('accounts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Account;
}

export async function createAccount(input: CreateAccountInput): Promise<Account> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('accounts')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as Account;
}

export async function updateAccount(input: UpdateAccountInput): Promise<Account> {
  const client = getSupabaseClient();
  const { id, ...updates } = input;
  const { data, error } = await client
    .from('accounts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Account;
}

export async function deleteAccount(id: string): Promise<void> {
  const client = getSupabaseClient();
  const { error } = await client.from('accounts').delete().eq('id', id);
  if (error) throw error;
}

// ============================================
// Categories API
// ============================================
export async function getCategories(type?: 'income' | 'expense'): Promise<Category[]> {
  const client = getSupabaseClient();
  let query = client.from('categories').select('*').order('name');

  if (type) {
    query = query.eq('type', type);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Category[];
}

export async function createCategory(input: CreateCategoryInput): Promise<Category> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('categories')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as Category;
}

// ============================================
// Transactions API
// ============================================
export async function getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
  const client = getSupabaseClient();
  let query = client
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })
    .order('time', { ascending: false });

  if (filters?.account_id) {
    query = query.eq('account_id', filters.account_id);
  }
  if (filters?.category_id) {
    query = query.eq('category_id', filters.category_id);
  }
  if (filters?.type) {
    query = query.eq('type', filters.type);
  }
  if (filters?.start_date) {
    query = query.gte('date', filters.start_date);
  }
  if (filters?.end_date) {
    query = query.lte('date', filters.end_date);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Transaction[];
}

export async function getTransactionById(id: string): Promise<Transaction> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('transactions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Transaction;
}

export async function createTransaction(input: CreateTransactionInput): Promise<Transaction> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('transactions')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as Transaction;
}

export async function updateTransaction(input: UpdateTransactionInput): Promise<Transaction> {
  const client = getSupabaseClient();
  const { id, ...updates } = input;
  const { data, error } = await client
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Transaction;
}

export async function deleteTransaction(id: string): Promise<void> {
  const client = getSupabaseClient();
  const { error } = await client.from('transactions').delete().eq('id', id);
  if (error) throw error;
}

// ============================================
// Budgets API
// ============================================
export async function getBudgets(): Promise<Budget[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('budgets')
    .select('*')
    .order('start_date', { ascending: false });

  if (error) throw error;
  return data as Budget[];
}

export async function getBudgetById(id: string): Promise<Budget> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('budgets')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Budget;
}

export async function createBudget(input: CreateBudgetInput): Promise<Budget> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('budgets')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as Budget;
}

export async function updateBudget(id: string, updates: Partial<CreateBudgetInput>): Promise<Budget> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('budgets')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Budget;
}

export async function deleteBudget(id: string): Promise<void> {
  const client = getSupabaseClient();
  const { error } = await client.from('budgets').delete().eq('id', id);
  if (error) throw error;
}

// ============================================
// Realtime Subscriptions
// ============================================
export function subscribeToTransactions(
  userId: string,
  callback: (payload: any) => void
) {
  const client = getSupabaseClient();
  
  const channel = client
    .channel('transactions-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'transactions',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
}

export function subscribeToAccounts(
  userId: string,
  callback: (payload: any) => void
) {
  const client = getSupabaseClient();
  
  const channel = client
    .channel('accounts-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'accounts',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
}