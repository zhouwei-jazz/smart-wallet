// ============================================
// Smart Wallet Core - Individual Transaction Hook
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTransactionById, updateTransaction, deleteTransaction } from '../api/supabase';
import type { Transaction, UpdateTransactionInput } from '../types';

// ============================================
// Individual Transaction Hook
// ============================================
export function useTransaction(id: string) {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: () => getTransactionById(id),
    enabled: !!id,
  });
}

// ============================================
// Update Transaction Hook
// ============================================
export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTransaction,
    onSuccess: (updatedTransaction: Transaction) => {
      // 更新单个交易缓存
      queryClient.setQueryData(['transaction', updatedTransaction.id], updatedTransaction);
      
      // 更新交易列表缓存
      queryClient.setQueryData(['transactions'], (old: Transaction[] | undefined) => {
        if (!old) return [updatedTransaction];
        return old.map(tx => tx.id === updatedTransaction.id ? updatedTransaction : tx);
      });
      
      // 重新获取账户数据（余额可能变化）
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

// ============================================
// Delete Transaction Hook
// ============================================
export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTransaction,
    onSuccess: (_, deletedId: string) => {
      // 移除单个交易缓存
      queryClient.removeQueries({ queryKey: ['transaction', deletedId] });
      
      // 更新交易列表缓存
      queryClient.setQueryData(['transactions'], (old: Transaction[] | undefined) => {
        if (!old) return [];
        return old.filter(tx => tx.id !== deletedId);
      });
      
      // 重新获取账户数据（余额可能变化）
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}