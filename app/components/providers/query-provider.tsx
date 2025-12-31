// ============================================
// Smart Wallet Mobile - React Query Provider
// ============================================

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 创建 QueryClient 实例
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (previously cacheTime)
      retry: (failureCount, error: any) => {
        // 不重试认证错误
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        // 最多重试 2 次
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export default QueryProvider;