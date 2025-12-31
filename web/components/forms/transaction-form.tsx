'use client';

import { useState } from 'react';
import { useCreateTransaction, useAccounts, useCategories, type CreateTransactionInput } from '@smart-wallet/core';

interface TransactionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TransactionForm({ onSuccess, onCancel }: TransactionFormProps) {
  const createTransaction = useCreateTransaction();
  const { data: accounts = [] } = useAccounts();
  const { data: expenseCategories = [] } = useCategories('expense');
  const { data: incomeCategories = [] } = useCategories('income');
  
  const [formData, setFormData] = useState<CreateTransactionInput>({
    account_id: '',
    category_id: '',
    amount: 0,
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
    merchant: '',
    note: '',
  });

  const [error, setError] = useState('');

  const categories = formData.type === 'expense' ? expenseCategories : incomeCategories;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.account_id) {
      setError('请选择账户');
      return;
    }

    if (formData.amount <= 0) {
      setError('请输入有效金额');
      return;
    }

    try {
      await createTransaction.mutateAsync(formData);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || '创建交易失败');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

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
          {categories.map((category) => (
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
          type="submit"
          disabled={createTransaction.isPending}
          className="flex-1 rounded-lg bg-sky-500 px-4 py-3 font-semibold text-white transition hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createTransaction.isPending ? '创建中...' : '创建交易'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-white/10 px-4 py-3 text-slate-300 transition hover:bg-white/5"
          >
            取消
          </button>
        )}
      </div>
    </form>
  );
}
