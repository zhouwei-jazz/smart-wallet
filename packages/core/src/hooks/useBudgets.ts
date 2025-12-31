// ============================================
// Smart Wallet Core - Budgets Hook
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBudgets, createBudget } from '../api/supabase';
import type { Budget, CreateBudgetInput } from '../types';

// ============================================
// Budgets Hook
// ============================================
export function useBudgets() {
  return useQuery({
    queryKey: ['budgets'],
    queryFn: getBudgets,
  });
}

// ============================================
// Create Budget Hook
// ============================================
export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBudget,
    onSuccess: (newBudget: Budget) => {
      queryClient.setQueryData(['budgets'], (old: Budget[] | undefined) => {
        if (!old) return [newBudget];
        return [...old, newBudget];
      });
    },
  });
}