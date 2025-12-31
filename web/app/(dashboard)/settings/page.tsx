'use client';

import { useState } from 'react';
import { useSupabase } from '@/components/providers/supabase-provider';
import { useTransactions, useAccounts } from '@smart-wallet/core';
import { Card } from '@/components/ui/card';

export default function SettingsPage() {
  const { user, signOut } = useSupabase();
  const { data: transactions = [] } = useTransactions();
  const { data: accounts = [] } = useAccounts();
  
  // 设置状态
  const [settings, setSettings] = useState({
    theme: 'dark',
    currency: 'CNY',
    language: 'zh-CN',
    notifications: {
      email: true,
      budget: true,
      transaction: false,
    },
    privacy: {
      analytics: true,
      marketing: false,
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  // 保存设置
  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // TODO: 调用 API 保存设置
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟 API 调用
      alert('设置已保存');
    } catch (error) {
      alert('保存失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 导出数据
  const handleExportData = () => {
    const csvData = [
      ['日期', '类型', '金额', '分类', '账户', '商家', '备注'],
      ...transactions.map(tx => [
        tx.date,
        tx.type === 'income' ? '收入' : '支出',
        tx.amount,
        tx.category_id || '未分类',
        tx.account_id || '未知账户',
        tx.merchant || '',
        tx.note || '',
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `smart-wallet-data-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 清除缓存
  const handleClearCache = () => {
    if (confirm('确定要清除所有缓存数据吗？这将刷新页面。')) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  // 退出登录
  const handleSignOut = async () => {
    if (confirm('确定要退出登录吗？')) {
      await signOut();
      window.location.href = '/login';
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">设置</h1>
          <p className="mt-2 text-slate-400">
            个人偏好与账户管理
          </p>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={isLoading}
          className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '保存中...' : '保存设置'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 个人信息 */}
        <Card className="border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-white mb-4">个人信息</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-sky-500 to-purple-500 flex items-center justify-center text-2xl font-bold text-white">
                {user?.user_metadata?.name?.[0] || user?.email?.[0] || 'U'}
              </div>
              <div>
                <p className="font-medium text-white">
                  {user?.user_metadata?.name || '未设置姓名'}
                </p>
                <p className="text-sm text-slate-400">
                  {user?.email}
                </p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                显示名称
              </label>
              <input
                type="text"
                defaultValue={user?.user_metadata?.name || ''}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                placeholder="输入您的姓名"
              />
            </div>
          </div>
        </Card>

        {/* 外观设置 */}
        <Card className="border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-white mb-4">外观设置</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                主题
              </label>
              <select
                value={settings.theme}
                onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="dark">深色模式</option>
                <option value="light">浅色模式</option>
                <option value="system">跟随系统</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                默认货币
              </label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="CNY">人民币 (¥)</option>
                <option value="USD">美元 ($)</option>
                <option value="EUR">欧元 (€)</option>
                <option value="JPY">日元 (¥)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                语言
              </label>
              <select
                value={settings.language}
                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="zh-CN">简体中文</option>
                <option value="zh-TW">繁体中文</option>
                <option value="en-US">English</option>
              </select>
            </div>
          </div>
        </Card>

        {/* 通知设置 */}
        <Card className="border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-white mb-4">通知设置</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">邮件通知</p>
                <p className="text-sm text-slate-400">接收重要更新和提醒</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.email}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, email: e.target.checked }
                })}
                className="h-5 w-5 rounded border-white/10 bg-white/5 text-sky-500 focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">预算提醒</p>
                <p className="text-sm text-slate-400">预算超支时发送提醒</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.budget}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, budget: e.target.checked }
                })}
                className="h-5 w-5 rounded border-white/10 bg-white/5 text-sky-500 focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">交易通知</p>
                <p className="text-sm text-slate-400">每笔交易后发送确认</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.transaction}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, transaction: e.target.checked }
                })}
                className="h-5 w-5 rounded border-white/10 bg-white/5 text-sky-500 focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>
        </Card>

        {/* 隐私设置 */}
        <Card className="border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-white mb-4">隐私设置</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">使用分析</p>
                <p className="text-sm text-slate-400">帮助改进产品体验</p>
              </div>
              <input
                type="checkbox"
                checked={settings.privacy.analytics}
                onChange={(e) => setSettings({
                  ...settings,
                  privacy: { ...settings.privacy, analytics: e.target.checked }
                })}
                className="h-5 w-5 rounded border-white/10 bg-white/5 text-sky-500 focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">营销邮件</p>
                <p className="text-sm text-slate-400">接收产品更新和优惠</p>
              </div>
              <input
                type="checkbox"
                checked={settings.privacy.marketing}
                onChange={(e) => setSettings({
                  ...settings,
                  privacy: { ...settings.privacy, marketing: e.target.checked }
                })}
                className="h-5 w-5 rounded border-white/10 bg-white/5 text-sky-500 focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>
        </Card>

        {/* 数据管理 */}
        <Card className="border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-white mb-4">数据管理</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">导出数据</p>
                <p className="text-sm text-slate-400">下载所有交易记录 (CSV)</p>
              </div>
              <button
                onClick={handleExportData}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5"
              >
                导出
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">清除缓存</p>
                <p className="text-sm text-slate-400">清除本地存储的数据</p>
              </div>
              <button
                onClick={handleClearCache}
                className="rounded-lg border border-red-500/20 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
              >
                清除
              </button>
            </div>
          </div>
        </Card>

        {/* 账户安全 */}
        <Card className="border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-white mb-4">账户安全</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">修改密码</p>
                <p className="text-sm text-slate-400">更新您的登录密码</p>
              </div>
              <button className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5">
                修改
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">两步验证</p>
                <p className="text-sm text-slate-400">增强账户安全性</p>
              </div>
              <button className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5">
                启用
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">活跃会话</p>
                <p className="text-sm text-slate-400">管理登录设备</p>
              </div>
              <button className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5">
                查看
              </button>
            </div>

            <div className="pt-4 border-t border-white/10">
              <button
                onClick={handleSignOut}
                className="w-full rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-400 transition hover:bg-red-500/20"
              >
                退出登录
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* 统计信息 */}
      <Card className="border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-white mb-4">使用统计</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{accounts.length}</p>
            <p className="text-sm text-slate-400">账户数量</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{transactions.length}</p>
            <p className="text-sm text-slate-400">交易记录</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {Math.ceil((Date.now() - new Date(user?.email ? '2024-01-01' : Date.now()).getTime()) / (1000 * 60 * 60 * 24))}
            </p>
            <p className="text-sm text-slate-400">使用天数</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {accounts.reduce((sum, acc) => sum + Number(acc.balance), 0).toFixed(0)}
            </p>
            <p className="text-sm text-slate-400">总资产 (¥)</p>
          </div>
        </div>
      </Card>
    </div>
  );
}