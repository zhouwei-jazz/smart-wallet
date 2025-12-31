import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/components/providers/query-provider';
import { SupabaseProvider } from '@/components/providers/supabase-provider';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const mono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Smart Wallet',
  description: '跨端智能记账 · Web Dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.variable} ${mono.variable} antialiased bg-slate-950 text-slate-100`}>
        <SupabaseProvider>
          <QueryProvider>{children}</QueryProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
