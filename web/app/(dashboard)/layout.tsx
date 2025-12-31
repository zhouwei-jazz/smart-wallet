'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSupabase } from '@/components/providers/supabase-provider';
import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';

const navItems = [
  { label: '概览', href: '/dashboard' },
  { label: '交易', href: '/dashboard/transactions' },
  { label: '账户', href: '/dashboard/accounts' },
  { label: '预算', href: '/dashboard/budgets' },
  { label: '分析', href: '/dashboard/analytics' },
  { label: '设置', href: '/dashboard/settings' },
];

export default function DashboardLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useSupabase();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto grid max-w-6xl grid-cols-[240px_1fr] gap-6 px-6 py-8 lg:px-10">
        <aside className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-xl p-5 shadow-2xl shadow-sky-900/20">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Smart Wallet</p>
            <h1 className="mt-2 text-lg font-semibold text-white">跨端智能记账</h1>
            <p className="text-sm text-slate-400">Web Dashboard</p>
          </div>

          {/* User Profile Section */}
          <div className="mb-6 rounded-xl border border-white/5 bg-slate-900/60 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-sky-500/30 bg-gradient-to-r from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                {user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.user_metadata?.name || user?.email?.split('@')[0]}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {user?.email}
                </p>
              </div>
              <button
                onClick={signOut}
                className="text-xs text-slate-400 hover:text-slate-300 px-2 py-1 rounded hover:bg-white/10"
                title="退出登录"
              >
                退出
              </button>
            </div>
          </div>

          <nav className="space-y-2 text-sm font-medium">
            {navItems.map((item) => {
              const active = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block w-full rounded-xl px-3 py-2 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 ${
                    active ? 'bg-sky-500 text-white shadow shadow-sky-500/30' : 'text-slate-200 hover:bg-white/10'
                  }`}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          
          <div className="mt-8 rounded-xl border border-white/5 bg-slate-900/60 p-4">
            <p className="text-xs text-slate-400">同步状态</p>
            <p className="mt-2 text-base font-semibold text-emerald-300">实时 · 正常</p>
            <p className="text-xs text-slate-500">Supabase Realtime</p>
          </div>
        </aside>

        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
}
