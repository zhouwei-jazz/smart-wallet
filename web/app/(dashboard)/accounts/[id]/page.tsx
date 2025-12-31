'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSupabase } from '@/components/providers/supabase-provider';
import { 
  useAccount, 
  useUpdateAccount, 
  useDeleteAccount,
  useTransactions,
  useCategories,
  useRealtimeSync,
  type UpdateAccountInput 
} from '@smart-wallet/core';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const ACCOUNT_TYPES = [
  { value: 'bank', label: '银行卡', icon: '🏦' },
  { value: 'cash', label: '现金', icon: '💵' },
  { value: 'alipay', label: '支付宝', icon: '💙' },
  { value: 'wechat', label: '微信', icon: '💚' },
  { value: 'credit', label: '信用卡', icon: '💳' },
  { value: 'other', label: '其他', icon: '📊' },
];

const COLORS = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6', 
  '#6366F1', '#8B5CF6', '#EC4899', '#06B6D4'
];

export default function AccountDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useSupabase();
  const accountId = params.id as string;
  
  // 启用实时同步
  useRealtimeSync(user?.id);
  
  // 获取数据
  const { data: account, isLoading } = useAccount(accountId);
  const { data: allTransactions = [] } = useTransactions();
  const { data: categories = [] } = useCategories();
  const updateAccount = useUpdateAccount();
  const deleteAccount = useDeleteAccount();
  
  // 状态
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState<UpdateAccountInput | null>(null);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // 过滤该账户的交易
  const accountTransactions = useMemo(() => {
    return allTransactions.filter(tx => tx.account_id === accountId);
  }, [allTransactions, accountId]);

  // 过滤时间范围内的交易
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    return accountTransactions.filter(tx => new Date(tx.date) >= startDate);
  }, [accountTransactions, timeRange]);

  // 计算余额趋势数据
  const balanceTrend = useMemo(() => {
    if (!account) return [];
    
    const sortedTransactions = [...filteredTransactions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    let runningBalance = Number(account.balance);
    const trendData = [];
    
    // 从最新余额往回推算
    for (let i = sortedTransactions.length - 1; i >= 0; i--) {
      const tx = sortedTransactions[i];
      if (tx.type === 'expense') {
        runningBalance += Math.abs(Number(tx.amount));
      } else {
        runningBalance -= Number(tx.amount);
      }
    }
    
    // 重新正向计算趋势
    for (const tx of sortedTransactions) {
      if (tx.type === 'expense') {
        runningBalance -= Math.abs(Number(tx.amount));
      } else {
        runningBalance += Number(tx.amount);
      }
      
      trendData.push({
        date: tx.date,
        balance: runningBalance,
      });
    }
    
    // 添加当前余额点
    trendData.push({
      date: new Date().toISOString().split('T')[0],
      balance: Number(account.balance),
    });
    
    return trendData;
  }, [account, filteredTransactions]);

  // 计算统计数据
  const stats = useMemo(() => {
    const totalExpense = filteredTransactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + Math.abs(Number(tx.amount)), 0);
    
    const totalIncome = filteredTransactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + Number(tx.amount), 0);
    
    const transactionCount = filteredTransactions.length;
    const avgTransaction = transactionCount > 0 ? (totalExpense + totalIncome) / transactionCount : 0;

    return {
      totalExpense,
      totalIncome,
      transactionCount,
      avgTransaction,
      netChange: totalIncome - totalExpense,
    };
  }, [filteredTransactions]);

  // 初始化表单数据
  const initFormData = () => {
    if (account && !formData) {
      setFormData({
        id: account.id,
        name: account.name,
        type: account.type,
        balance: Number(account.balance),
        currency: account.currency || 'CNY',
        icon: account.icon || '🏦',
        color: account.color || '#3B82F6',
        institution: account.institution || '',
        is_default: account.is_default || false,
      });
    }
  };

  const handleEdit = () => {
    initFormData();
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!formData) return;
    
    setError('');
    
    if (!formData.name?.trim()) {
      setError('请输入账户名称');
      return;
    }

    try {
      await updateAccount.mutateAsync(formData);
      setIsEditing(false);
      setFormData(null);
    } catch (err: any) {
      setError(err.message || '更新账户失败');
    }
  };

  const handleDelete = async () => {
    if (!account) return;
    
    try {
      await deleteAccount.mutateAsync(account.id);
      router.push('/dashboard/accounts');
    } catch (err: any) {
      setError(err.message || '删除账户失败');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(null);
    setError('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-400">加载中...</div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-slate-400">账户不存在</p>
          <button
            onClick={() => router.push('/dashboard/accounts')}
            className="mt-4 text-sky-400 hover:text-sky-300"
          >
            返回账户列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard/accounts')}
            className="text-slate-400 hover:text-white transition"
          >
            ← 返回
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">账户详情</h1>
            <p className="mt-2 text-slate-400">
              {account.type} · {account.institution || '无机构信息'}
            </p>
          </div>
        </div>
        
        {!isEditing && (
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-600"
            >
              编辑
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
            >
              删除
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* 账户信息 */}
      <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="p-6">
          {isEditing && formData ? (
            // 编辑模式
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  账户名称 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  placeholder="例如：招商银行"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  账户类型 *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {ACCOUNT_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: type.value as any, icon: type.icon })}
                      className={`rounded-lg border p-3 text-center transition ${
                        formData.type === type.value
                          ? 'border-sky-500 bg-sky-500/10 text-white'
                          : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <div className="text-2xl mb-1">{type.icon}</div>
                      <div className="text-xs">{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  当前余额
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  机构名称（可选）
                </label>
                <input
                  type="text"
                  value={formData.institution || ''}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  placeholder="例如：招商银行深圳分行"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  颜色标识
                </label>
                <div className="flex gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`h-10 w-10 rounded-full transition ${
                        formData.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_default"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                  className="h-4 w-4 rounded border-white/10 bg-white/5 text-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
                <label htmlFor="is_default" className="text-sm text-slate-300">
                  设为默认账户
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={updateAccount.isPending}
                  className="flex-1 rounded-lg bg-sky-500 px-4 py-3 font-semibold text-white transition hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateAccount.isPending ? '保存中...' : '保存'}
                </button>
                <button
                  onClick={handleCancel}
                  className="rounded-lg border border-white/10 px-4 py-3 text-slate-300 transition hover:bg-white/5"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            // 查看模式
            <div className="space-y-6">
              {/* 账户概览 */}
              <div className="text-center">
                <div className="text-6xl mb-4">{account.icon}</div>
                <h2 className="text-2xl font-bold text-white">{account.name}</h2>
                <p className="text-slate-400">{ACCOUNT_TYPES.find(t => t.value === account.type)?.label}</p>
                <p className="mt-4 text-4xl font-bold text-white">
                  ¥ {Number(account.balance).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                </p>
                {account.is_default && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800 mt-2">
                    默认账户
                  </span>
                )}
              </div>

              {/* 详细信息 */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-400">账户类型</p>
                  <p className="mt-1 text-lg font-medium text-white">
                    {ACCOUNT_TYPES.find(t => t.value === account.type)?.label}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">币种</p>
                  <p className="mt-1 text-lg font-medium text-white">
                    {account.currency || 'CNY'}
                  </p>
                </div>

                {account.institution && (
                  <div className="sm:col-span-2">
                    <p className="text-sm text-slate-400">机构</p>
                    <p className="mt-1 text-lg font-medium text-white">
                      {account.institution}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-slate-400">创建时间</p>
                  <p className="mt-1 text-lg font-medium text-white">
                    {new Date(account.created_at).toLocaleDateString('zh-CN')}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">最后更新</p>
                  <p className="mt-1 text-lg font-medium text-white">
                    {new Date(account.updated_at).toLocaleDateString('zh-CN')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* 统计数据 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">账户统计</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
        >
          <option value="7d">近7天</option>
          <option value="30d">近30天</option>
          <option value="90d">近90天</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <p className="text-sm text-slate-400">总支出</p>
          <p className="mt-2 text-2xl font-bold text-red-400">
            ¥ {stats.totalExpense.toFixed(2)}
          </p>
        </Card>
        
        <Card className="border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <p className="text-sm text-slate-400">总收入</p>
          <p className="mt-2 text-2xl font-bold text-emerald-400">
            ¥ {stats.totalIncome.toFixed(2)}
          </p>
        </Card>

        <Card className="border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <p className="text-sm text-slate-400">交易笔数</p>
          <p className="mt-2 text-2xl font-bold text-white">
            {stats.transactionCount}
          </p>
        </Card>

        <Card className="border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <p className="text-sm text-slate-400">净变化</p>
          <p className={`mt-2 text-2xl font-bold ${
            stats.netChange >= 0 ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {stats.netChange >= 0 ? '+' : ''}¥ {stats.netChange.toFixed(2)}
          </p>
        </Card>
      </div>

      {/* 余额趋势图 */}
      {balanceTrend.length > 0 && (
        <Card className="border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-white mb-4">余额趋势</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={balanceTrend}>
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
                  formatter={(value: number | undefined) => [`¥${(value || 0).toFixed(2)}`, '余额']}
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke={account.color || '#3B82F6'}
                  strokeWidth={2}
                  dot={{ fill: account.color || '#3B82F6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* 最近交易 */}
      <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">最近交易</h3>
            <button
              onClick={() => router.push(`/dashboard/transactions?account=${accountId}`)}
              className="text-sky-400 hover:text-sky-300 text-sm"
            >
              查看全部 →
            </button>
          </div>
          
          {accountTransactions.length === 0 ? (
            <p className="text-center text-slate-400 py-8">暂无交易记录</p>
          ) : (
            <div className="divide-y divide-white/5">
              {accountTransactions.slice(0, 10).map((tx) => {
                const category = categories.find((c) => c.id === tx.category_id);
                
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
                          {tx.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-semibold ${
                          tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}¥ {Math.abs(Number(tx.amount)).toFixed(2)}
                      </p>
                      <button
                        onClick={() => router.push(`/dashboard/transactions/${tx.id}`)}
                        className="text-xs text-slate-400 hover:text-sky-400"
                      >
                        查看详情
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* 删除确认模态框 */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="确认删除"
      >
        <div className="space-y-4">
          <p className="text-slate-300">
            确定要删除账户 "{account.name}" 吗？此操作无法撤销，相关的交易记录也会被删除。
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              disabled={deleteAccount.isPending}
              className="flex-1 rounded-lg bg-red-500 px-4 py-3 font-semibold text-white transition hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleteAccount.isPending ? '删除中...' : '确认删除'}
            </button>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="rounded-lg border border-white/10 px-4 py-3 text-slate-300 transition hover:bg-white/5"
            >
              取消
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}