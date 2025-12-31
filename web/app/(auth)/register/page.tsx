'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Eye, EyeOff, Github } from 'lucide-react';
import { useSupabase } from '@/components/providers/supabase-provider';

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useSupabase();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 登录后直接跳转到主页
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // 验证密码
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('密码至少需要6个字符');
      setLoading(false);
      return;
    }

    try {
      const { createClientSupabaseClient } = await import('@/lib/supabase');
      const supabase = createClientSupabaseClient();
      
      // 注册用户
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          }
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          setError('该邮箱已被注册');
        } else {
          setError(error.message);
        }
        return;
      }

      if (data.user) {
        // 检查是否需要邮箱验证
        if (data.user.email_confirmed_at) {
          // 邮箱已确认，直接跳转
          router.push('/dashboard');
        } else {
          // 需要邮箱验证
          setSuccess('注册成功！请检查您的邮箱并点击验证链接。');
        }
      }
    } catch (err: any) {
      setError(err.message || '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleGithubSignup = async () => {
    try {
      const { createClientSupabaseClient } = await import('@/lib/supabase');
      const supabase = createClientSupabaseClient();
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) {
        setError('GitHub 注册失败');
      }
    } catch (err) {
      setError('GitHub 注册失败');
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <Card className="w-full max-w-md border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">创建账户</h1>
          <p className="mt-2 text-slate-400">开始您的智能钱包之旅</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-emerald-400">
              {success}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
              姓名
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              placeholder="请输入您的姓名"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              邮箱
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
              密码
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 pr-12"
                placeholder="至少6个字符"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
              确认密码
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 pr-12"
                placeholder="再次输入密码"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-3 font-semibold text-white transition hover:from-sky-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '注册中...' : '创建账户'}
          </button>
        </form>

        <div className="mt-6 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-slate-950 px-2 text-slate-400">或者使用</span>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleGithubSignup}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 flex items-center justify-center gap-2"
          >
            <Github className="h-5 w-5" />
            使用 GitHub 注册
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-slate-400">
          已有账户？{' '}
          <a href="/login" className="text-white font-semibold hover:text-slate-300">
            立即登录
          </a>
        </div>

        <div className="mt-4 text-center text-xs text-slate-500">
          注册即表示您同意我们的{' '}
          <a href="#" className="text-slate-400 hover:text-slate-300">服务条款</a>
          {' '}和{' '}
          <a href="#" className="text-slate-400 hover:text-slate-300">隐私政策</a>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-500">
          安全保障由{' '}
          <span className="font-semibold text-slate-400">🔒 Supabase</span> 提供
        </div>
      </Card>
    </div>
  );
}