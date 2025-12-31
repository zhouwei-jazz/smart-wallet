# Smart Wallet - 完整项目指南

> 最后更新：2024-12-28  
> 项目状态：Phase 2 完成（65% 整体进度）

## 📋 目录

- [项目概述](#项目概述)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [开发指南](#开发指南)
- [部署指南](#部署指南)
- [常见问题](#常见问题)

---

## 项目概述

Smart Wallet 是一个基于 Next.js + Expo + InsForge 的现代化跨平台财务管理工具。

### 核心特性

- 🔐 **安全认证** - NextAuth + InsForge Auth + OAuth (Google/GitHub)
- 💰 **多账户管理** - 银行卡、现金、支付宝、微信等
- 📊 **智能分类** - 22 个预设分类 + 自定义分类
- 📸 **OCR 识别** - AI 驱动的票据识别（计划中）
- 🔄 **实时同步** - WebSocket 多端数据即时同步
- 📱 **跨平台** - Web + iOS + Android
- 🎨 **现代 UI** - 玻璃态设计 + 深色模式

### 技术亮点

- **Monorepo 架构** - pnpm workspaces 管理
- **90% 代码复用** - packages/core 共享业务逻辑
- **类型安全** - 全栈 TypeScript + 严格模式
- **实时协作** - InsForge Realtime 驱动
- **离线优先** - 支持离线操作（计划中）

---

## 技术栈

### 前端框架

| 技术 | 版本 | 用途 |
|------|------|------|
| **Next.js** | 16.1.0 | Web 应用框架（App Router） |
| **Expo** | 54.0.30 | React Native 开发工具链 |
| **React** | 19.2.3 (Web) / 19.1.0 (Mobile) | UI 库 |
| **TypeScript** | 5.9.3 | 类型系统 |

### 样式系统

| 技术 | 版本 | 说明 |
|------|------|------|
| **Tailwind CSS** | 4.1.18 | Web 原子化 CSS |
| **NativeWind** | - | Tailwind for React Native（计划中） |

### 状态与数据

| 技术 | 版本 | 用途 |
|------|------|------|
| **TanStack Query** | 5.90.12 | 服务端状态管理 + 缓存 |
| **Zustand** | 4.5.7 (Web) / 5.0.9 (Mobile) | 客户端全局状态 |
| **InsForge SDK** | 1.0.7 | 后端 API 客户端 |

### 后端服务（InsForge）

| 服务 | 说明 | 状态 |
|------|------|------|
| **Auth** | 邮箱登录 + OAuth (Google/GitHub) | ✅ 已配置 |
| **Database** | PostgreSQL + RLS | ✅ 已配置 |
| **Realtime** | WebSocket 实时订阅 | ✅ 已配置 |
| **Storage** | 文件存储（receipts bucket） | ✅ 已配置 |
| **AI** | OpenAI GPT-4o + Gemini 3 Pro | ✅ 已配置 |

### 工程化工具

| 工具 | 版本 | 用途 |
|------|------|------|
| **pnpm** | 最新 | Monorepo 包管理 |
| **ESLint** | 9.39.2 | 代码检查 |
| **Prettier** | 3.7.4 | 代码格式化 |

---

## 项目结构

```
smart-wallet/
├── packages/
│   └── core/                    # 共享核心包 ✅
│       ├── src/
│       │   ├── types/           # TypeScript 类型定义
│       │   ├── api/             # InsForge API 客户端
│       │   └── hooks/           # React Query hooks
│       └── package.json
│
├── web/                         # Next.js Web 应用 ✅
│   ├── app/
│   │   ├── (auth)/              # 认证页面
│   │   │   └── login/           # 登录页面 ✅
│   │   ├── (dashboard)/         # Dashboard 页面
│   │   │   ├── dashboard/       # 总览页 ✅
│   │   │   ├── transactions/    # 交易列表（占位）
│   │   │   ├── accounts/        # 账户管理（占位）
│   │   │   ├── analytics/       # 数据分析（占位）
│   │   │   └── settings/        # 设置（占位）
│   │   └── api/
│   │       └── auth/[...nextauth]/ # NextAuth API ✅
│   ├── components/
│   │   ├── forms/               # 表单组件 ✅
│   │   └── ui/                  # UI 组件 ✅
│   ├── lib/
│   │   ├── auth.ts              # NextAuth 配置 ✅
│   │   └── insforge-init.ts     # InsForge 初始化 ✅
│   ├── middleware.ts            # 路由保护 ✅
│   └── .env.local               # 环境变量 ✅
│
├── app/                         # Expo Mobile 应用 ✅
│   ├── app/
│   │   ├── (auth)/              # 认证页面（待实现）
│   │   └── (tabs)/              # Tab 导航 ✅
│   │       ├── index.tsx        # Overview 页面 ✅
│   │       ├── wallet.tsx       # 钱包页面（占位）
│   │       ├── analytics.tsx    # 分析页面（占位）
│   │       └── profile.tsx      # 个人页面（占位）
│   └── .env                     # 环境变量 ✅
│
├── insforge-schema.sql          # 数据库表结构 ✅
├── insforge-rls.sql             # RLS 策略 ✅
├── insforge-seed.sql            # 预设数据 ✅
├── pnpm-workspace.yaml          # pnpm 工作区配置 ✅
├── pnpm-lock.yaml               # pnpm 锁文件 ✅
└── package.json                 # 根 package.json ✅
```

---

## 快速开始

### 前置要求

- **Node.js** 20+
- **pnpm** 9+ （`npm install -g pnpm`）
- **InsForge 账户** - [dashboard.insforge.app](https://dashboard.insforge.app)

### 1. 克隆项目

```bash
git clone <repository-url>
cd smart-wallet
```

### 2. 安装依赖

```bash
# 一键安装所有依赖（pnpm workspaces）
pnpm install
```

### 3. 配置环境变量

#### Web 端 (`web/.env.local`)

```env
# InsForge 配置
NEXT_PUBLIC_INSFORGE_BASE_URL=https://4mam7f8a.ap-southeast.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# NextAuth 配置
NEXTAUTH_SECRET=<生成的密钥>
NEXTAUTH_URL=http://localhost:3000

# OAuth 配置（可选）
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

**生成 NEXTAUTH_SECRET:**

```bash
# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Linux/Mac
openssl rand -base64 32
```

#### Mobile 端 (`app/.env`)

```env
EXPO_PUBLIC_INSFORGE_BASE_URL=https://4mam7f8a.ap-southeast.insforge.app
EXPO_PUBLIC_INSFORGE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. 启动开发服务器

#### Web 端

```bash
pnpm --filter web dev
# 或
cd web && pnpm dev

# 访问 http://localhost:3000
```

#### Mobile 端

```bash
pnpm --filter app start
# 或
cd app && pnpm start

# 扫描二维码或按 'i' (iOS) / 'a' (Android)
```

---

## 开发指南

### 数据库 Schema

#### 核心表

| 表名 | 说明 | 记录数 | RLS |
|------|------|--------|-----|
| **users** | 用户信息 | 0 | ✅ |
| **accounts** | 账户（银行卡、现金等） | 0 | ✅ |
| **categories** | 分类（收入/支出） | 22 | ✅ |
| **transactions** | 交易记录 | 0 | ✅ |
| **budgets** | 预算管理 | 0 | ✅ |

#### 系统预设分类（22 条）

**支出分类（15 个）:**
餐饮、交通、购物、娱乐、医疗、教育、住房、通讯、服饰、美容、运动、旅游、宠物、礼物、其他

**收入分类（7 个）:**
工资、奖金、投资、兼职、红包、退款、其他

### 使用共享 Hooks

```typescript
import { 
  useAccounts, 
  useTransactions, 
  useCategories,
  useRealtimeSync 
} from 'smart-wallet-core';

function MyComponent() {
  // 获取数据
  const { data: accounts, isLoading } = useAccounts();
  const { data: transactions } = useTransactions();
  const { data: categories } = useCategories('expense');
  
  // 启用实时同步
  const { data: session } = useSession();
  useRealtimeSync(session?.user?.id);
  
  return <div>...</div>;
}
```

### 创建数据

```typescript
import { useCreateAccount, useCreateTransaction } from 'smart-wallet-core';

function AddAccountForm() {
  const createAccount = useCreateAccount();
  
  const handleSubmit = async (data) => {
    await createAccount.mutateAsync({
      name: '招商银行',
      type: 'bank',
      balance: 10000,
      currency: 'CNY',
    });
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

### 认证流程

#### Web 端

```typescript
import { signIn, signOut, useSession } from 'next-auth/react';

// 登录
await signIn('credentials', {
  email: 'user@example.com',
  password: 'password',
});

// OAuth 登录
await signIn('google');

// 登出
await signOut();

// 获取 session
const { data: session } = useSession();
```

#### 路由保护

所有 `/dashboard/*` 路由自动受保护（`web/middleware.ts`）。

### 实时同步

```typescript
import { useRealtimeSync } from 'smart-wallet-core';

function App() {
  const { data: session } = useSession();
  
  // 一行代码启用实时同步
  useRealtimeSync(session?.user?.id);
  
  // 数据变化自动同步到所有设备
}
```

---

## 部署指南

### Web 端部署（Vercel）

```bash
# 1. 构建
pnpm --filter web build

# 2. 部署到 Vercel
vercel deploy

# 3. 配置环境变量
# 在 Vercel Dashboard 中设置所有 .env.local 变量
```

### Mobile 端部署（EAS）

```bash
# 1. 安装 EAS CLI
npm install -g eas-cli

# 2. 登录
eas login

# 3. 配置
eas build:configure

# 4. 构建 Android APK
eas build --platform android --profile preview

# 5. 构建 iOS
eas build --platform ios --profile preview
```

---

## 常见问题

### Q: pnpm install 失败

**A:** 确保使用 pnpm 9+，清理缓存后重试：

```bash
pnpm store prune
pnpm install
```

### Q: TypeScript 找不到 smart-wallet-core

**A:** 确保 `web/tsconfig.json` 中配置了路径映射：

```json
{
  "compilerOptions": {
    "paths": {
      "smart-wallet-core": ["../packages/core/src"]
    }
  }
}
```

### Q: NextAuth 报错 "No secret provided"

**A:** 生成并设置 `NEXTAUTH_SECRET`：

```bash
openssl rand -base64 32
```

### Q: InsForge 连接失败

**A:** 检查环境变量：

```bash
# 确保 .env.local 中设置了正确的值
NEXT_PUBLIC_INSFORGE_BASE_URL=https://4mam7f8a.ap-southeast.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=eyJ...
```

### Q: 数据库查询返回空数组

**A:** 检查是否已登录，RLS 策略要求用户认证。

---

## 项目进度

### Phase 1: 基础设施 ✅ 100%

- ✅ 数据库 Schema
- ✅ Monorepo 结构（pnpm）
- ✅ 认证系统基础
- ✅ 共享类型和 Hooks
- ✅ 环境变量配置

### Phase 2: 核心功能 ✅ 100%

- ✅ Web Dashboard 使用真实 API
- ✅ 账户表单组件
- ✅ 交易表单组件
- ✅ 实时同步启用
- ✅ 模态框组件

### Phase 3: 高级功能 ⏳ 0%

- ⏳ Mobile 端后端集成
- ⏳ OCR 票据识别
- ⏳ 数据可视化（图表）
- ⏳ 离线支持
- ⏳ 推送通知

**整体进度: 65%**

---

## 下一步计划

### 立即可做

1. **添加模态框到 Dashboard** - 集成账户和交易表单
2. **完善 Web 端页面** - 交易列表、账户详情、数据分析
3. **Mobile 端集成** - 接入 InsForge 和认证

### 短期目标（1-2 周）

1. 完成所有 Web 端页面
2. Mobile 端后端集成
3. 实现图表可视化
4. 添加筛选和搜索功能

### 长期目标（1-2 月）

1. OCR 票据识别
2. 离线支持
3. 推送通知
4. 多币种支持
5. 定期账单

---

## 有用的命令

```bash
# 开发
pnpm --filter web dev          # 启动 Web
pnpm --filter app start        # 启动 Mobile

# 构建
pnpm --filter web build        # 构建 Web
pnpm --filter app android      # 构建 Android

# 代码检查
pnpm lint                      # ESLint
pnpm type-check                # TypeScript

# 清理
pnpm clean                     # 清理所有 node_modules
```

---

## 相关资源

- **InsForge 文档**: https://docs.insforge.dev
- **React Query 文档**: https://tanstack.com/query
- **Next.js 文档**: https://nextjs.org/docs
- **Expo 文档**: https://docs.expo.dev
- **pnpm 文档**: https://pnpm.io

---

**Made with ❤️ using Next.js, Expo, and InsForge**
