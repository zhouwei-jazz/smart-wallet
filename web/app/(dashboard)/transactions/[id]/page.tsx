'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSupabase } from '@/components/providers/supabase-provider';
import { 
  useTransaction, 
  useUpdateTransaction, 
  useDeleteTransaction,
  useAccounts, 
  useCategories,
  useRealtimeSync,
  type UpdateTransactionInput 
} from '@smart-wallet/core';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useSupabase();
  const transactionId = params.id as string;
  
  // 启用实时同步
  useRealtimeSync(user?.id);
  
  // 获取数据
  const { data: transaction, isLoading } = useTransaction(transactionId);
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();
  
  // 状态
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState<UpdateTransactionInput | null>(null);
  const [error, setError] = useState('');

  // 初始化表单数据
  const initFormData = () => {
    if (transaction && !formData) {
      setFormData({
        id: transaction.id,
        account_id: transaction.account_id,
        category_id: transaction.category_id || '',
        amount: Math.abs(Number(transaction.amount)),
        type: transaction.type,
        date: transaction.date,
        merchant: transaction.merchant || '',
        note: transaction.note || '',
      });
    }
  };

  // 获取关联数据
  const account = accounts.find(a => a.id === transaction?.account_id);
  const category = categories.find(c => c.id === transaction?.category_id);
  const expenseCategories = categories.filter(c => c.type === 'expense');
  const incomeCategories = categories.filter(c => c.type === 'income');

  const handleEdit = () => {
    initFormData();
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!formData) return;
    
    setError('');
    
    if (!formData.amount || formData.amount <= 0) {
      setError('请输入有效金额');
      return;
    }

    try {
      await updateTransaction.mutateAsync(formData);
      setIsEditing(false);
      setFormData(null);
    } catch (err: any) {
      setError(err.message || '更新交易失败');
    }
  };

  const handleDelete = async () => {
    if (!transaction) return;
    
    try {
      await deleteTransaction.mutateAsync(transaction.id);
      router.push('/dashboard/transactions');
    } catch (err: any) {
      setError(err.message || '删除交易失败');
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

  if (!transaction) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-slate-400">交易不存在</p>
          <button
            onClick={() => router.push('/dashboard/transactions')}
            className="mt-4 text-sky-400 hover:text-sky-300"
          >
            返回交易列表
          </button>
        </div>
      </div>
    );
  }

  const currentCategories = formData?.type === 'expense' ? expenseCategories : incomeCategories;

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard/transactions')}
            className="text-slate-400 hover:text-white transition"
          >
            ← 返回
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">交易详情</h1>
            <p className="mt-2 text-slate-400">
              {transaction.date} · {account?.name}
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

      {/* 交易信息 */}
      <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="p-6">
          {isEditing && formData ? (
            // 编辑模式
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  类型 *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'expense', category_id: '' })}
                    className={`rounded-lg border p-3 text-center transition ${
                      formData.type === 'expense'
                        ? 'border-red-500 bg-red-500/10 text-white'
                        : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <div className="text-2xl mb-1">💸</div>
                    <div className="text-sm">支出</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'income', category_id: '' })}
                    className={`rounded-lg border p-3 text-center transition ${
                      formData.type === 'income'
                        ? 'border-emerald-500 bg-emerald-500/10 text-white'
                        : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <div className="text-2xl mb-1">💰</div>
                    <div className="text-sm">收入</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  金额 *
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
                  账户 *
                </label>
                <select
                  value={formData.account_id}
                  onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  required
                >
                  <option value="">选择账户</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} (¥{Number(account.balance).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  分类
                </label>
                <select
                  value={formData.category_id || ''}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                >
                  <option value="">选择分类</option>
                  {currentCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  商家/来源
                </label>
                <input
                  type="text"
                  value={formData.merchant || ''}
                  onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  placeholder="例如：星巴克"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  日期 *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  备注
                </label>
                <textarea
                  value={formData.note || ''}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  placeholder="添加备注..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={updateTransaction.isPending}
                  className="flex-1 rounded-lg bg-sky-500 px-4 py-3 font-semibold text-white transition hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateTransaction.isPending ? '保存中...' : '保存'}
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
              {/* 金额和类型 */}
              <div className="text-center">
                <div className="text-6xl mb-4">
                  {transaction.type === 'expense' ? '💸' : '💰'}
                </div>
                <p
                  className={`text-4xl font-bold ${
                    transaction.type === 'income' ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {transaction.type === 'income' ? '+' : '-'}¥ {Math.abs(Number(transaction.amount)).toFixed(2)}
                </p>
                <p className="mt-2 text-slate-400">
                  {transaction.type === 'expense' ? '支出' : '收入'}
                </p>
              </div>

              {/* 详细信息 */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-400">账户</p>
                  <p className="mt-1 text-lg font-medium text-white">
                    {account?.icon} {account?.name || '未知账户'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">分类</p>
                  <p className="mt-1 text-lg font-medium text-white">
                    {category?.icon} {category?.name || '未分类'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">日期</p>
                  <p className="mt-1 text-lg font-medium text-white">
                    {new Date(transaction.date).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'long'
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">时间</p>
                  <p className="mt-1 text-lg font-medium text-white">
                    {transaction.time || '未记录'}
                  </p>
                </div>

                {transaction.merchant && (
                  <div>
                    <p className="text-sm text-slate-400">商家/来源</p>
                    <p className="mt-1 text-lg font-medium text-white">
                      {transaction.merchant}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-slate-400">状态</p>
                  <p className="mt-1 text-lg font-medium text-white">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transaction.status === 'posted' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {transaction.status === 'posted' ? '已完成' : '待处理'}
                    </span>
                  </p>
                </div>
              </div>

              {transaction.note && (
                <div>
                  <p className="text-sm text-slate-400">备注</p>
                  <p className="mt-1 text-white bg-white/5 rounded-lg p-3">
                    {transaction.note}
                  </p>
                </div>
              )}

              {/* 票据图片 */}
              {transaction.image_url && (
                <div>
                  <p className="text-sm text-slate-400 mb-2">票据</p>
                  <img
                    src={transaction.image_url}
                    alt="票据"
                    className="max-w-full h-auto rounded-lg border border-white/10"
                  />
                </div>
              )}
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
            确定要删除这笔交易吗？此操作无法撤销。
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              disabled={deleteTransaction.isPending}
              className="flex-1 rounded-lg bg-red-500 px-4 py-3 font-semibold text-white transition hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleteTransaction.isPending ? '删除中...' : '确认删除'}
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