// ============================================
// Smart Wallet - Categories Hooks
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories, createCategory } from '../api/supabase';
import type { CreateCategoryInput, TransactionType } from '../types';

// ============================================
// Query Keys
// ============================================
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (type?: TransactionType) => [...categoryKeys.lists(), type] as const,
};

// ============================================
// Queries
// ============================================
export function useCategories(type?: TransactionType) {
  return useQuery({
    queryKey: categoryKeys.list(type),
    queryFn: () => getCategories(type),
  });
}

// ============================================
// Mutations
// ============================================
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCategoryInput) => createCategory(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}
