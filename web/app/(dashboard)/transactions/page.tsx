'use client';

import { useState, useMemo } from 'react';
import { useSupabase } from '@/components/providers/supabase-provider';
import { useTransactions, useAccounts, useCategories, useRealtimeSync } from '@smart-wallet/core';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { TransactionForm } from '@/components/forms/transaction-form';

export default function TransactionsPage() {
  const { user } = useSupabase();
  
  // 启用实时同步
  useRealtimeSync(user?.id);
  
  // 获取数据
  const { data: transactions = [], isLoading: transactionsLoading } = useTransactions();
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  
  // 状态
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 20;

  // 筛选和搜索
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // 按类型筛选
    if (selectedType !== 'all') {
      filtered = filtered.filter(tx => tx.type === selectedType);
    }

    // 按账户筛选
    if (selectedAccount !== 'all') {
      filtered = filtered.filter(tx => tx.account_id === selectedAccount);
    }

    // 按分类筛选
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tx => tx.category_id === selectedCategory);
    }

    // 按商家名称搜索
    if (searchTerm) {
      filtered = filtered.filter(tx => 
        tx.merchant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        categories.find(c => c.id === tx.category_id)?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [transactions, selectedType, selectedAccount, selectedCategory, searchTerm, categories]);

  // 分页
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 统计
  const stats = useMemo(() => {
    const totalExpense = filteredTransactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + Math.abs(Number(tx.amount)), 0);
    
    const totalIncome = filteredTransactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    return {
      totalExpense,
      totalIncome,
      count: filteredTransactions.length,
    };
  }, [filteredTransactions]);

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
          <h1 className="text-3xl font-bold text-white">交易记录</h1>
          <p className="mt-2 text-slate-400">
            共 {stats.count} 笔交易
          </p>
        </div>
        <button
          onClick={() => setShowTransactionModal(true)}
          className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-600"
        >
          + 添加交易
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
          <p className="text-sm text-slate-400">净收入</p>
          <p className={`mt-2 text-2xl font-bold ${
            stats.totalIncome - stats.totalExpense >= 0 ? 'text-emerald-400' : 'text-red-400'
          }`}>
            ¥ {(stats.totalIncome - stats.totalExpense).toFixed(2)}
          </p>
        </Card>
      </div>

      {/* 筛选和搜索 */}
      <Card className="border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* 搜索 */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              搜索
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              placeholder="搜索商家或分类..."
            />
          </div>

          {/* 类型筛选 */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              类型
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="all">全部</option>
              <option value="expense">支出</option>
              <option value="income">收入</option>
            </select>
          </div>

          {/* 账户筛选 */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              账户
            </label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="all">全部账户</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>

          {/* 分类筛选 */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              分类
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="all">全部分类</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 清除筛选 */}
        {(selectedType !== 'all' || selectedAccount !== 'all' || selectedCategory !== 'all' || searchTerm) && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <button
              onClick={() => {
                setSelectedType('all');
                setSelectedAccount('all');
                setSelectedCategory('all');
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="text-sm text-sky-400 hover:text-sky-300 transition"
            >
              清除所有筛选
            </button>
          </div>
        )}
      </Card>

      {/* 交易列表 */}
      <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
        {paginatedTransactions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-400">
              {transactions.length === 0 ? '还没有交易记录' : '没有符合条件的交易'}
            </p>
          </div>
        ) : (
          <>
            {/* 表头 */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 p-4 text-sm font-medium text-slate-400 border-b border-white/5">
              <div>交易信息</div>
              <div>账户</div>
              <div>分类</div>
              <div>日期</div>
              <div className="text-right">金额</div>
            </div>

            {/* 交易列表 */}
            <div className="divide-y divide-white/5">
              {paginatedTransactions.map((tx) => {
                const account = accounts.find(a => a.id === tx.account_id);
                const category = categories.find(c => c.id === tx.category_id);
                
                return (
                  <div key={tx.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 p-4 hover:bg-white/5 transition cursor-pointer"
                    onClick={() => window.location.href = `/dashboard/transactions/${tx.id}`}>
                    <div>
                      <p className="font-medium text-white">
                        {tx.merchant || category?.name || '未分类'}
                      </p>
                      {tx.note && (
                        <p className="text-sm text-slate-400 mt-1">{tx.note}</p>
                      )}
                    </div>
                    <div className="text-slate-300">
                      {account?.name || '未知账户'}
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <span>{category?.icon || '📊'}</span>
                      <span>{category?.name || '未分类'}</span>
                    </div>
                    <div className="text-slate-300">
                      {tx.date}
                    </div>
                    <div className={`text-right font-semibold ${
                      tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}¥ {Math.abs(Number(tx.amount)).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">
            显示 {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} 条，
            共 {filteredTransactions.length} 条
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            <span className="flex items-center px-3 py-2 text-sm text-slate-300">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        </div>
      )}

      {/* 添加交易模态框 */}
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