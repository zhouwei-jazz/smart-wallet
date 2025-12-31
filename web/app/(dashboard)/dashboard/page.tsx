'use client';

import { useState, useMemo } from 'react';
import { useSupabase } from '@/components/providers/supabase-provider';
import { useAccounts, useTransactions, useCategories, useRealtimeSync } from '@smart-wallet/core';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { AccountForm } from '@/components/forms/account-form';
import { TransactionForm } from '@/components/forms/transaction-form';

export default function DashboardPage() {
  const { user } = useSupabase();
  
  // 模态框状态
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  
  // 启用实时同步
  useRealtimeSync(user?.id);
  
  // 获取真实数据
  const { data: accounts = [], isLoading: accountsLoading } = useAccounts();
  const { data: transactions = [], isLoading: transactionsLoading } = useTransactions();
  const { data: categories = [] } = useCategories();

  // 计算指标
  const metrics = useMemo(() => {
    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
    
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const savingRate = totalIncome ? ((totalIncome - totalExpense) / totalIncome) : 0;
    const budgetLeft = 3200; // TODO: 从 budgets 表获取

    return [
      { 
        title: '本月支出', 
        value: `¥ ${totalExpense.toFixed(2)}`, 
        change: '-8.2%', 
        trend: 'down' as const 
      },
      { 
        title: '收入', 
        value: `¥ ${totalIncome.toFixed(2)}`, 
        change: '+5.1%', 
        trend: 'up' as const 
      },
      { 
        title: '储蓄率', 
        value: `${Math.round(savingRate * 100)}%`, 
        change: '+3.2%', 
        trend: 'up' as const 
      },
      { 
        title: '预算剩余', 
        value: `¥ ${budgetLeft.toLocaleString()}`, 
        change: '+12%', 
        trend: 'up' as const 
      },
    ];
  }, [transactions]);

  // 计算总余额
  const totalBalance = useMemo(() => {
    return accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
  }, [accounts]);

  if (accountsLoading || transactionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-white">财务概览</h1>
        <p className="mt-2 text-slate-400">
          {user?.user_metadata?.name || user?.email || '欢迎回来'}
        </p>
      </div>

      {/* 关键指标 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card
            key={metric.title}
            className="border-white/10 bg-white/5 p-6 backdrop-blur-xl"
          >
            <p className="text-sm text-slate-400">{metric.title}</p>
            <p className="mt-2 text-2xl font-bold text-white">{metric.value}</p>
            <p
              className={`mt-2 text-sm ${
                metric.trend === 'up' ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {metric.change}
            </p>
          </Card>
        ))}
      </div>

      {/* 账户概览 */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">账户概览</h2>
          <button 
            onClick={() => setShowAccountModal(true)}
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-600"
          >
            + 添加账户
          </button>
        </div>
        
        {accounts.length === 0 ? (
          <Card className="border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl">
            <p className="text-slate-400">还没有账户，点击上方按钮添加第一个账户</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
              <div
                key={account.id}
                style={{ borderLeftColor: account.color || '#6366F1', borderLeftWidth: '4px' }}
              >
                <Card className="border-white/10 bg-white/5 p-6 backdrop-blur-xl h-full">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">{account.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{account.type}</p>
                    </div>
                    <div className="text-2xl">{account.icon || '💳'}</div>
                  </div>
                  <p className="mt-4 text-2xl font-bold text-white">
                    ¥ {Number(account.balance).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                  </p>
                </Card>
              </div>
            ))}
          </div>
        )}
        
        <Card className="mt-4 border-white/10 bg-gradient-to-br from-sky-500/10 to-purple-500/10 p-6 backdrop-blur-xl">
          <p className="text-sm text-slate-400">总余额</p>
          <p className="mt-2 text-3xl font-bold text-white">
            ¥ {totalBalance.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
          </p>
        </Card>
      </div>

      {/* 最近交易 */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">最近交易</h2>
          <button 
            onClick={() => setShowTransactionModal(true)}
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-600"
          >
            + 记一笔
          </button>
        </div>
        
        {transactions.length === 0 ? (
          <Card className="border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl">
            <p className="text-slate-400">还没有交易记录，点击上方按钮添加第一笔交易</p>
          </Card>
        ) : (
          <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
            <div className="divide-y divide-white/5">
              {transactions.slice(0, 10).map((tx) => {
                const category = categories.find((c) => c.id === tx.category_id);
                const account = accounts.find((a) => a.id === tx.account_id);
                
                return (
                  <div key={tx.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5">
                        {category?.icon || '💰'}
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {tx.merchant || category?.name || '未分类'}
                        </p>
                        <p className="text-sm text-slate-400">
                          {account?.name} · {tx.date}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`text-lg font-semibold ${
                        tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}¥ {Math.abs(Number(tx.amount)).toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>

      {/* 分类统计 */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-white">支出分类</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories
            .filter((c) => c.type === 'expense')
            .slice(0, 10)
            .map((category) => {
              const categoryTotal = transactions
                .filter((t) => t.category_id === category.id && t.type === 'expense')
                .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

              return (
                <div
                  key={category.id}
                  style={{ borderTopColor: category.color || '#6366F1', borderTopWidth: '3px' }}
                >
                  <Card className="border-white/10 bg-white/5 p-4 backdrop-blur-xl h-full">
                    <div className="text-center">
                      <div className="text-2xl">{category.icon || '📊'}</div>
                      <p className="mt-2 text-sm text-slate-400">{category.name}</p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        ¥ {categoryTotal.toFixed(0)}
                      </p>
                    </div>
                  </Card>
                </div>
              );
            })}
        </div>
      </div>

      {/* 模态框 */}
      <Modal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        title="添加账户"
      >
        <AccountForm
          onSuccess={() => setShowAccountModal(false)}
          onCancel={() => setShowAccountModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        title="添加交易"
      >
        <TransactionForm
          onSuccess={() => setShowTransactionModal(false)}
          onCancel={() => setShowTransactionModal(false)}
        />
      </Modal>
    </div>
  );
}
