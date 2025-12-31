'use client';

import { useState, useMemo } from 'react';
import { useSupabase } from '@/components/providers/supabase-provider';
import { useBudgets, useCreateBudget, useCategories, useTransactions, useRealtimeSync } from '@smart-wallet/core';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';

interface BudgetFormData {
  category_id: string;
  amount: number;
  period: 'monthly' | 'weekly' | 'yearly';
  start_date: string;
}

export default function BudgetsPage() {
  const { user } = useSupabase();
  
  // 启用实时同步
  useRealtimeSync(user?.id);
  
  // 获取数据
  const { data: budgets = [], isLoading: budgetsLoading } = useBudgets();
  const { data: categories = [] } = useCategories('expense');
  const { data: transactions = [] } = useTransactions();
  const createBudget = useCreateBudget();
  
  // 状态
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [formData, setFormData] = useState<BudgetFormData>({
    category_id: '',
    amount: 0,
    period: 'monthly',
    start_date: new Date().toISOString().split('T')[0],
  });
  const [error, setError] = useState('');

  // 计算预算执行情况
  const budgetsWithProgress = useMemo(() => {
    return budgets.map(budget => {
      const category = categories.find(c => c.id === budget.category_id);
      
      // 计算当前周期的支出
      const now = new Date();
      const startDate = new Date(budget.start_date);
      let periodStart = new Date(startDate);
      
      // 根据周期类型计算当前周期开始时间
      if (budget.period === 'monthly') {
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (budget.period === 'weekly') {
        const dayOfWeek = now.getDay();
        periodStart = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
      } else if (budget.period === 'yearly') {
        periodStart = new Date(now.getFullYear(), 0, 1);
      }
      
      // 计算当前周期的支出
      const spent = transactions
        .filter(tx => 
          tx.type === 'expense' &&
          tx.category_id === budget.category_id &&
          new Date(tx.date) >= periodStart &&
          new Date(tx.date) <= now
        )
        .reduce((sum, tx) => sum + Math.abs(Number(tx.amount)), 0);
      
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      const remaining = budget.amount - spent;
      
      return {
        ...budget,
        category,
        spent,
        percentage,
        remaining,
        isOverBudget: spent > budget.amount,
      };
    });
  }, [budgets, categories, transactions]);

  // 总体统计
  const totalStats = useMemo(() => {
    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = budgetsWithProgress.reduce((sum, b) => sum + b.spent, 0);
    const overBudgetCount = budgetsWithProgress.filter(b => b.isOverBudget).length;
    
    return {
      totalBudget,
      totalSpent,
      totalRemaining: totalBudget - totalSpent,
      overBudgetCount,
      budgetCount: budgets.length,
    };
  }, [budgets, budgetsWithProgress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.category_id) {
      setError('请选择分类');
      return;
    }

    if (formData.amount <= 0) {
      setError('请输入有效金额');
      return;
    }

    try {
      await createBudget.mutateAsync(formData);
      setShowBudgetModal(false);
      setFormData({
        category_id: '',
        amount: 0,
        period: 'monthly',
        start_date: new Date().toISOString().split('T')[0],
      });
    } catch (err: any) {
      setError(err.message || '创建预算失败');
    }
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'weekly': return '每周';
      case 'monthly': return '每月';
      case 'yearly': return '每年';
      default: return period;
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  if (budgetsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">预算管理</h1>
          <p className="mt-2 text-slate-400">
            设置和跟踪您的支出预算
          </p>
        </div>
        <button
          onClick={() => setShowBudgetModal(true)}
          className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-600"
        >
          + 创建预算
        </button>
      </div>

      {/* 总体统计 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <p className="text-sm text-slate-400">总预算</p>
          <p className="mt-2 text-2xl font-bold text-white">
            ¥ {totalStats.totalBudget.toFixed(2)}
          </p>
        </Card>
        
        <Card className="border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <p className="text-sm text-slate-400">已支出</p>
          <p className="mt-2 text-2xl font-bold text-red-400">
            ¥ {totalStats.totalSpent.toFixed(2)}
          </p>
        </Card>

        <Card className="border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <p className="text-sm text-slate-400">剩余预算</p>
          <p className={`mt-2 text-2xl font-bold ${
            totalStats.totalRemaining >= 0 ? 'text-emerald-400' : 'text-red-400'
          }`}>
            ¥ {totalStats.totalRemaining.toFixed(2)}
          </p>
        </Card>

        <Card className="border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <p className="text-sm text-slate-400">超支预算</p>
          <p className="mt-2 text-2xl font-bold text-white">
            {totalStats.overBudgetCount} / {totalStats.budgetCount}
          </p>
        </Card>
      </div>

      {/* 预算列表 */}
      {budgetsWithProgress.length === 0 ? (
        <Card className="border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl">
          <div className="text-6xl mb-4">🎯</div>
          <p className="text-xl font-semibold text-white mb-2">还没有预算</p>
          <p className="text-slate-400 mb-4">创建您的第一个预算来控制支出</p>
          <button
            onClick={() => setShowBudgetModal(true)}
            className="rounded-lg bg-sky-500 px-6 py-3 font-medium text-white transition hover:bg-sky-600"
          >
            创建预算
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {budgetsWithProgress.map((budget) => (
            <Card
              key={budget.id}
              className={`border-white/10 bg-white/5 p-6 backdrop-blur-xl ${
                budget.isOverBudget ? 'border-red-500/30' : ''
              }`}
            >
              {/* 预算头部 */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">
                    {budget.category?.icon || '📊'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">
                      {budget.category?.name || '未分类'}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {getPeriodLabel(budget.period)}预算
                    </p>
                  </div>
                </div>
                {budget.isOverBudget && (
                  <span className="rounded-full bg-red-500/20 px-2 py-1 text-xs text-red-400">
                    超支
                  </span>
                )}
              </div>

              {/* 预算进度 */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">
                    已用 ¥{budget.spent.toFixed(2)} / ¥{budget.amount.toFixed(2)}
                  </span>
                  <span className={`text-sm font-medium ${
                    budget.isOverBudget ? 'text-red-400' : 'text-slate-300'
                  }`}>
                    {budget.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getProgressColor(budget.percentage)}`}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* 预算详情 */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">剩余</p>
                  <p className={`font-semibold ${
                    budget.remaining >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    ¥ {budget.remaining.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">周期</p>
                  <p className="font-semibold text-white">
                    {getPeriodLabel(budget.period)}
                  </p>
                </div>
              </div>

              {/* 预算建议 */}
              {budget.percentage > 80 && (
                <div className={`mt-4 p-3 rounded-lg ${
                  budget.isOverBudget 
                    ? 'bg-red-500/10 border border-red-500/20' 
                    : 'bg-yellow-500/10 border border-yellow-500/20'
                }`}>
                  <p className={`text-sm ${
                    budget.isOverBudget ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {budget.isOverBudget 
                      ? `已超支 ¥${Math.abs(budget.remaining).toFixed(2)}，建议调整支出计划`
                      : '预算即将用完，请注意控制支出'
                    }
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* 创建预算模态框 */}
      <Modal
        isOpen={showBudgetModal}
        onClose={() => setShowBudgetModal(false)}
        title="创建预算"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              分类 *
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              required
            >
              <option value="">选择分类</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              预算金额 *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount || ''}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              预算周期 *
            </label>
            <select
              value={formData.period}
              onChange={(e) => setFormData({ ...formData, period: e.target.value as any })}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              required
            >
              <option value="weekly">每周</option>
              <option value="monthly">每月</option>
              <option value="yearly">每年</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              开始日期 *
            </label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={createBudget.isPending}
              className="flex-1 rounded-lg bg-sky-500 px-4 py-3 font-semibold text-white transition hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createBudget.isPending ? '创建中...' : '创建预算'}
            </button>
            <button
              type="button"
              onClick={() => setShowBudgetModal(false)}
              className="rounded-lg border border-white/10 px-4 py-3 text-slate-300 transition hover:bg-white/5"
            >
              取消
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}