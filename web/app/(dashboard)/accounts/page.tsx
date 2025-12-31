'use client';

import { useState, useMemo } from 'react';
import { useSupabase } from '@/components/providers/supabase-provider';
import { useAccounts, useTransactions, useRealtimeSync } from '@smart-wallet/core';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { AccountForm } from '@/components/forms/account-form';

const ACCOUNT_TYPE_LABELS = {
  bank: '银行卡',
  cash: '现金',
  alipay: '支付宝',
  wechat: '微信',
  credit: '信用卡',
  other: '其他',
};

const ACCOUNT_TYPE_ICONS = {
  bank: '🏦',
  cash: '💵',
  alipay: '💙',
  wechat: '💚',
  credit: '💳',
  other: '📊',
};

export default function AccountsPage() {
  const { user } = useSupabase();
  
  // 启用实时同步
  useRealtimeSync(user?.id);
  
  // 获取数据
  const { data: accounts = [], isLoading: accountsLoading } = useAccounts();
  const { data: transactions = [] } = useTransactions();
  
  // 状态
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');

  // 筛选账户
  const filteredAccounts = useMemo(() => {
    if (selectedType === 'all') return accounts;
    return accounts.filter(account => account.type === selectedType);
  }, [accounts, selectedType]);

  // 计算每个账户的统计信息
  const accountsWithStats = useMemo(() => {
    return filteredAccounts.map(account => {
      const accountTransactions = transactions.filter(tx => tx.account_id === account.id);
      const totalTransactions = accountTransactions.length;
      const lastTransaction = accountTransactions.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];

      return {
        ...account,
        totalTransactions,
        lastTransaction,
      };
    });
  }, [filteredAccounts, transactions]);

  // 总统计
  const totalStats = useMemo(() => {
    const totalBalance = filteredAccounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
    const accountsByType = filteredAccounts.reduce((acc, account) => {
      acc[account.type] = (acc[account.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalBalance,
      totalAccounts: filteredAccounts.length,
      accountsByType,
    };
  }, [filteredAccounts]);

  if (accountsLoading) {
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
          <h1 className="text-3xl font-bold text-white">账户管理</h1>
          <p className="mt-2 text-slate-400">
            共 {totalStats.totalAccounts} 个账户
          </p>
        </div>
        <button
          onClick={() => setShowAccountModal(true)}
          className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-600"
        >
          + 添加账户
        </button>
      </div>

      {/* 总览统计 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/10 bg-gradient-to-br from-sky-500/10 to-purple-500/10 p-6 backdrop-blur-xl">
          <p className="text-sm text-slate-400">总余额</p>
          <p className="mt-2 text-3xl font-bold text-white">
            ¥ {totalStats.totalBalance.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
          </p>
        </Card>
        
        <Card className="border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <p className="text-sm text-slate-400">账户数量</p>
          <p className="mt-2 text-2xl font-bold text-white">{totalStats.totalAccounts}</p>
        </Card>

        <Card className="border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <p className="text-sm text-slate-400">银行卡</p>
          <p className="mt-2 text-2xl font-bold text-white">
            {totalStats.accountsByType.bank || 0}
          </p>
        </Card>

        <Card className="border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <p className="text-sm text-slate-400">电子钱包</p>
          <p className="mt-2 text-2xl font-bold text-white">
            {(totalStats.accountsByType.alipay || 0) + (totalStats.accountsByType.wechat || 0)}
          </p>
        </Card>
      </div>

      {/* 筛选 */}
      <Card className="border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedType('all')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              selectedType === 'all'
                ? 'bg-sky-500 text-white'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            全部 ({accounts.length})
          </button>
          {Object.entries(ACCOUNT_TYPE_LABELS).map(([type, label]) => {
            const count = accounts.filter(acc => acc.type === type).length;
            if (count === 0) return null;
            
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  selectedType === type
                    ? 'bg-sky-500 text-white'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {ACCOUNT_TYPE_ICONS[type as keyof typeof ACCOUNT_TYPE_ICONS]} {label} ({count})
              </button>
            );
          })}
        </div>
      </Card>

      {/* 账户列表 */}
      {accountsWithStats.length === 0 ? (
        <Card className="border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl">
          <div className="text-6xl mb-4">💳</div>
          <p className="text-xl font-semibold text-white mb-2">还没有账户</p>
          <p className="text-slate-400 mb-4">添加您的第一个账户开始记账</p>
          <button
            onClick={() => setShowAccountModal(true)}
            className="rounded-lg bg-sky-500 px-6 py-3 font-medium text-white transition hover:bg-sky-600"
          >
            添加账户
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accountsWithStats.map((account) => (
            <div
              key={account.id}
              className="cursor-pointer"
              style={{ 
                borderLeftColor: account.color || '#6366F1', 
                borderLeftWidth: '4px' 
              }}
              onClick={() => window.location.href = `/dashboard/accounts/${account.id}`}
            >
              <Card className="border-white/10 bg-white/5 p-6 backdrop-blur-xl hover:bg-white/10 transition h-full">
              {/* 账户头部 */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">
                    {account.icon || ACCOUNT_TYPE_ICONS[account.type as keyof typeof ACCOUNT_TYPE_ICONS] || '📊'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{account.name}</h3>
                    <p className="text-sm text-slate-400">
                      {ACCOUNT_TYPE_LABELS[account.type as keyof typeof ACCOUNT_TYPE_LABELS] || account.type}
                    </p>
                  </div>
                </div>
                {account.is_default && (
                  <span className="rounded-full bg-sky-500/20 px-2 py-1 text-xs text-sky-400">
                    默认
                  </span>
                )}
              </div>

              {/* 余额 */}
              <div className="mb-4">
                <p className="text-sm text-slate-400">当前余额</p>
                <p className="text-2xl font-bold text-white">
                  ¥ {Number(account.balance).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                </p>
              </div>

              {/* 统计信息 */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div>
                  <p className="text-xs text-slate-400">交易笔数</p>
                  <p className="text-sm font-semibold text-white">{account.totalTransactions}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">最近交易</p>
                  <p className="text-sm font-semibold text-white">
                    {account.lastTransaction 
                      ? account.lastTransaction.date 
                      : '无'
                    }
                  </p>
                </div>
              </div>

              {/* 机构信息 */}
              {account.institution && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-xs text-slate-400">开户机构</p>
                  <p className="text-sm text-slate-300">{account.institution}</p>
                </div>
              )}
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* 添加账户模态框 */}
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
    </div>
  );
}