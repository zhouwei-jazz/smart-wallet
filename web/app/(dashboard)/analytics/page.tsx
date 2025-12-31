'use client';

import { useState, useMemo } from 'react';
import { useSupabase } from '@/components/providers/supabase-provider';
import { useTransactions, useAccounts, useCategories, useRealtimeSync } from '@smart-wallet/core';
import { Card } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

export default function AnalyticsPage() {
  const { user } = useSupabase();
  
  // 启用实时同步
  useRealtimeSync(user?.id);
  
  // 获取数据
  const { data: transactions = [], isLoading: transactionsLoading } = useTransactions();
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  
  // 状态
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [chartType, setChartType] = useState<'expense' | 'income' | 'both'>('expense');

  // 过滤时间范围内的交易
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    return transactions.filter(tx => new Date(tx.date) >= startDate);
  }, [transactions, timeRange]);

  // 计算趋势数据（按日期分组）
  const trendData = useMemo(() => {
    const dailyData = new Map<string, { date: string; expense: number; income: number }>();
    
    filteredTransactions.forEach(tx => {
      const date = tx.date;
      const existing = dailyData.get(date) || { date, expense: 0, income: 0 };
      
      if (tx.type === 'expense') {
        existing.expense += Math.abs(Number(tx.amount));
      } else {
        existing.income += Number(tx.amount);
      }
      
      dailyData.set(date, existing);
    });

    return Array.from(dailyData.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredTransactions]);

  // 计算分类分布数据
  const categoryData = useMemo(() => {
    const categoryMap = new Map<string, { name: string; value: number; color: string; icon: string }>();
    
    filteredTransactions
      .filter(tx => chartType === 'both' || tx.type === chartType)
      .forEach(tx => {
        const category = categories.find(c => c.id === tx.category_id);
        const categoryName = category?.name || '未分类';
        const categoryIcon = category?.icon || '📊';
        const categoryColor = category?.color || '#6366F1';
        
        const existing = categoryMap.get(categoryName) || { 
          name: categoryName, 
          value: 0, 
          color: categoryColor,
          icon: categoryIcon 
        };
        existing.value += Math.abs(Number(tx.amount));
        categoryMap.set(categoryName, existing);
      });

    return Array.from(categoryMap.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // 只显示前8个分类
  }, [filteredTransactions, categories, chartType]);

  // 计算账户分布数据
  const accountData = useMemo(() => {
    return accounts.map(account => ({
      name: account.name,
      balance: Number(account.balance),
      color: account.color || '#6366F1',
      icon: account.icon || '💳',
    })).sort((a, b) => b.balance - a.balance);
  }, [accounts]);

  // 计算月度对比数据
  const monthlyData = useMemo(() => {
    const monthlyMap = new Map<string, { month: string; expense: number; income: number }>();
    
    filteredTransactions.forEach(tx => {
      const date = new Date(tx.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short' });
      
      const existing = monthlyMap.get(monthKey) || { month: monthName, expense: 0, income: 0 };
      
      if (tx.type === 'expense') {
        existing.expense += Math.abs(Number(tx.amount));
      } else {
        existing.income += Number(tx.amount);
      }
      
      monthlyMap.set(monthKey, existing);
    });

    return Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredTransactions]);

  // 计算关键指标
  const metrics = useMemo(() => {
    const totalExpense = filteredTransactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + Math.abs(Number(tx.amount)), 0);
    
    const totalIncome = filteredTransactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + Number(tx.amount), 0);
    
    const avgDailyExpense = totalExpense / (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365);
    const savingRate = totalIncome ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
    
    const topCategory = categoryData[0];
    const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

    return {
      totalExpense,
      totalIncome,
      avgDailyExpense,
      savingRate,
      topCategory: topCategory?.name || '无',
      topCategoryAmount: topCategory?.value || 0,
      totalBalance,
      transactionCount: filteredTransactions.length,
    };
  }, [filteredTransactions, categoryData, accounts, timeRange]);

  if (transactionsLoading) {
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
          <h1 className="text-3xl font-bold text-white">数据分析</h1>
          <p className="mt-2 text-slate-400">
            财务数据洞察与趋势分析
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          >
            <option value="7d">近7天</option>
            <option value="30d">近30天</option>
            <option value="90d">近90天</option>
            <option value="1y">近1年</option>
          </select>
          <button className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5">
            导出报表
          </button>
        </div>
      </div>

      {/* 关键指标 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <p className="text-sm text-slate-400">总支出</p>
          <p className="mt-2 text-2xl font-bold text-red-400">
            ¥ {metrics.totalExpense.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            日均 ¥{metrics.avgDailyExpense.toFixed(2)}
          </p>
        </Card>
        
        <Card className="border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <p className="text-sm text-slate-400">总收入</p>
          <p className="mt-2 text-2xl font-bold text-emerald-400">
            ¥ {metrics.totalIncome.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            储蓄率 {metrics.savingRate.toFixed(1)}%
          </p>
        </Card>

        <Card className="border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <p className="text-sm text-slate-400">最大支出分类</p>
          <p className="mt-2 text-2xl font-bold text-white">
            {metrics.topCategory}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            ¥{metrics.topCategoryAmount.toFixed(2)}
          </p>
        </Card>

        <Card className="border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <p className="text-sm text-slate-400">交易笔数</p>
          <p className="mt-2 text-2xl font-bold text-white">
            {metrics.transactionCount}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            总余额 ¥{metrics.totalBalance.toFixed(2)}
          </p>
        </Card>
      </div>

      {/* 图表类型选择 */}
      <Card className="border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <div className="flex gap-2">
          <button
            onClick={() => setChartType('expense')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              chartType === 'expense'
                ? 'bg-red-500 text-white'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            支出分析
          </button>
          <button
            onClick={() => setChartType('income')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              chartType === 'income'
                ? 'bg-emerald-500 text-white'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            收入分析
          </button>
          <button
            onClick={() => setChartType('both')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              chartType === 'both'
                ? 'bg-sky-500 text-white'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            综合分析
          </button>
        </div>
      </Card>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 趋势图 */}
        <Card className="border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-white mb-4">收支趋势</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Legend />
                {(chartType === 'expense' || chartType === 'both') && (
                  <Area
                    type="monotone"
                    dataKey="expense"
                    stackId="1"
                    stroke="#EF4444"
                    fill="#EF4444"
                    fillOpacity={0.3}
                    name="支出"
                  />
                )}
                {(chartType === 'income' || chartType === 'both') && (
                  <Area
                    type="monotone"
                    dataKey="income"
                    stackId="1"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.3}
                    name="收入"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 分类分布饼图 */}
        <Card className="border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-white mb-4">分类分布</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.color || COLORS[categoryData.indexOf(entry) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                  formatter={(value: number | undefined) => [`¥${(value || 0).toFixed(2)}`, '金额']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 账户余额分布 */}
        <Card className="border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-white mb-4">账户余额</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accountData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="#9CA3AF" 
                  fontSize={12}
                  width={80}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                  formatter={(value: number | undefined) => [`¥${(value || 0).toFixed(2)}`, '余额']}
                />
                <Bar dataKey="balance" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 月度对比 */}
        <Card className="border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-white mb-4">月度对比</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="month" 
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Legend />
                <Bar dataKey="expense" fill="#EF4444" name="支出" />
                <Bar dataKey="income" fill="#10B981" name="收入" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* 分类详细列表 */}
      <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">分类详情</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categoryData.map((category, index) => (
              <div
                key={category.name}
                className="flex items-center gap-3 p-4 rounded-lg bg-white/5"
              >
                <div className="text-2xl">{category.icon}</div>
                <div className="flex-1">
                  <p className="font-medium text-white">{category.name}</p>
                  <p className="text-sm text-slate-400">
                    ¥{category.value.toFixed(2)}
                  </p>
                </div>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}