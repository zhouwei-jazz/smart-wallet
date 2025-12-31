// ============================================
// Smart Wallet Core - Individual Account Hook
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAccountById, updateAccount, deleteAccount } from '../api/supabase';
import type { Account, UpdateAccountInput } from '../types';

// ============================================
// Individual Account Hook
// ============================================
export function useAccount(id: string) {
  return useQuery({
    queryKey: ['account', id],
    queryFn: () => getAccountById(id),
    enabled: !!id,
  });
}

// ============================================
// Update Account Hook
// ============================================
export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAccount,
    onSuccess: (updatedAccount: Account) => {
      // 更新单个账户缓存
      queryClient.setQueryData(['account', updatedAccount.id], updatedAccount);
      
      // 更新账户列表缓存
      queryClient.setQueryData(['accounts'], (old: Account[] | undefined) => {
        if (!old) return [updatedAccount];
        return old.map(acc => acc.id === updatedAccount.id ? updatedAccount : acc);
      });
    },
  });
}

// ============================================
// Delete Account Hook
// ============================================
export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: (_, deletedId: string) => {
      // 移除单个账户缓存
      queryClient.removeQueries({ queryKey: ['account', deletedId] });
      
      // 更新账户列表缓存
      queryClient.setQueryData(['accounts'], (old: Account[] | undefined) => {
        if (!old) return [];
        return old.filter(acc => acc.id !== deletedId);
      });
      
      // 重新获取交易数据（可能有关联交易）
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}