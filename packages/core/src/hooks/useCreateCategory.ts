// ============================================
// Smart Wallet Core - Create Category Hook
// ============================================

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCategory } from '../api/supabase';
import type { Category, CreateCategoryInput } from '../types';

// ============================================
// Create Category Hook
// ============================================
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: (newCategory: Category) => {
      queryClient.setQueryData(['categories'], (old: Category[] | undefined) => {
        if (!old) return [newCategory];
        return [...old, newCategory];
      });
      
      // 也更新按类型筛选的缓存
      queryClient.setQueryData(['categories', newCategory.type], (old: Category[] | undefined) => {
        if (!old) return [newCategory];
        return [...old, newCategory];
      });
    },
  });
}