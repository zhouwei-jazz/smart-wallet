'use client';

import { useState } from 'react';
import { useCreateAccount, type CreateAccountInput } from '@smart-wallet/core';

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

interface AccountFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AccountForm({ onSuccess, onCancel }: AccountFormProps) {
  const createAccount = useCreateAccount();
  
  const [formData, setFormData] = useState<CreateAccountInput>({
    name: '',
    type: 'bank',
    balance: 0,
    currency: 'CNY',
    icon: '🏦',
    color: '#3B82F6',
    institution: '',
    is_default: false,
  });

  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('请输入账户名称');
      return;
    }

    try {
      await createAccount.mutateAsync(formData);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || '创建账户失败');
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
          初始余额
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
          type="submit"
          disabled={createAccount.isPending}
          className="flex-1 rounded-lg bg-sky-500 px-4 py-3 font-semibold text-white transition hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createAccount.isPending ? '创建中...' : '创建账户'}
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
