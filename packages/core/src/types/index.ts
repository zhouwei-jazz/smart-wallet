// ============================================
// Smart Wallet - 共享类型定义
// ============================================

export type AccountType = 'bank' | 'cash' | 'alipay' | 'wechat' | 'credit' | 'other';
export type TransactionType = 'income' | 'expense';
export type TransactionStatus = 'pending' | 'posted' | 'void';
export type BudgetPeriod = 'monthly' | 'weekly' | 'yearly';
export type Currency = 'CNY' | 'USD' | 'EUR' | 'GBP' | 'JPY';

// ============================================
// User
// ============================================
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  default_currency: Currency;
  created_at: string;
  updated_at: string;
}

// ============================================
// Account
// ============================================
export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: Currency;
  icon: string | null;
  color: string | null;
  institution: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAccountInput {
  name: string;
  type: AccountType;
  balance?: number;
  currency?: Currency;
  icon?: string;
  color?: string;
  institution?: string;
  is_default?: boolean;
}

export interface UpdateAccountInput extends Partial<CreateAccountInput> {
  id: string;
}

// ============================================
// Category
// ============================================
export interface Category {
  id: string;
  user_id: string | null;
  name: string;
  type: TransactionType;
  icon: string | null;
  color: string | null;
  parent_id: string | null;
  is_system: boolean;
  created_at: string;
}

export interface CreateCategoryInput {
  name: string;
  type: TransactionType;
  icon?: string;
  color?: string;
  parent_id?: string;
}

// ============================================
// Transaction
// ============================================
export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string | null;
  amount: number;
  type: TransactionType;
  date: string;
  time: string | null;
  merchant: string | null;
  note: string | null;
  image_url: string | null;
  tags: string[] | null;
  location: TransactionLocation | null;
  status: TransactionStatus;
  created_at: string;
  updated_at: string;
}

export interface TransactionLocation {
  lat: number;
  lng: number;
  address?: string;
}

export interface CreateTransactionInput {
  account_id: string;
  category_id?: string;
  amount: number;
  type: TransactionType;
  date?: string;
  time?: string;
  merchant?: string;
  note?: string;
  image_url?: string;
  tags?: string[];
  location?: TransactionLocation;
  status?: TransactionStatus;
}

export interface UpdateTransactionInput extends Partial<CreateTransactionInput> {
  id: string;
}

// ============================================
// Budget
// ============================================
export interface Budget {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: number;
  spent: number;
  period: BudgetPeriod;
  start_date: string;
  end_date: string | null;
  currency: Currency;
  created_at: string;
}

export interface CreateBudgetInput {
  category_id?: string;
  amount: number;
  period: BudgetPeriod;
  start_date: string;
  end_date?: string;
  currency?: Currency;
}

// ============================================
// API Response Types
// ============================================
export interface ApiResponse<T> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: {
    message: string;
    code?: string;
    details?: any;
  };
}

// ============================================
// Query Filters
// ============================================
export interface TransactionFilters {
  account_id?: string;
  category_id?: string;
  type?: TransactionType;
  start_date?: string;
  end_date?: string;
  min_amount?: number;
  max_amount?: number;
  merchant?: string;
  tags?: string[];
  status?: TransactionStatus;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// ============================================
// Analytics Types
// ============================================
export interface ExpenseSummary {
  total: number;
  by_category: Array<{
    category_id: string;
    category_name: string;
    amount: number;
    percentage: number;
  }>;
  by_account: Array<{
    account_id: string;
    account_name: string;
    amount: number;
  }>;
}

export interface IncomeSummary {
  total: number;
  by_category: Array<{
    category_id: string;
    category_name: string;
    amount: number;
  }>;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
  net: number;
}
