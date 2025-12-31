// ============================================
// Smart Wallet - Realtime Hooks
// ============================================

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { subscribeToTransactions, subscribeToAccounts } from '../api/supabase';
import { transactionKeys } from './useTransactions';
import { accountKeys } from './useAccounts';

// ============================================
// Realtime Subscriptions
// ============================================
export function useRealtimeTransactions(userId: string | undefined) {
  // 检查是否在客户端环境
  if (typeof window === 'undefined') {
    return;
  }
  
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;
    
    // 再次检查是否在客户端环境
    if (typeof window === 'undefined') return;

    try {
      const unsubscribe = subscribeToTransactions(userId, (payload) => {
        console.log('Transaction changed:', payload);
        
        // Invalidate all transaction queries
        queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
        
        // Also invalidate accounts as balance may change
        queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up transaction subscription:', error);
    }
  }, [userId, queryClient]);
}

export function useRealtimeAccounts(userId: string | undefined) {
  // 检查是否在客户端环境
  if (typeof window === 'undefined') {
    return;
  }
  
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;
    
    // 再次检查是否在客户端环境
    if (typeof window === 'undefined') return;

    try {
      const unsubscribe = subscribeToAccounts(userId, (payload) => {
        console.log('Account changed:', payload);
        
        // Invalidate all account queries
        queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up account subscription:', error);
    }
  }, [userId, queryClient]);
}

// Combined hook for convenience
export function useRealtimeSync(userId: string | undefined) {
  // 检查是否在客户端环境
  if (typeof window === 'undefined') {
    return;
  }
  
  useRealtimeTransactions(userId);
  useRealtimeAccounts(userId);
}
