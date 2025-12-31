# Smart Wallet - 跨端智能记账应用

> 基于 Next.js + Expo + Supabase 的现代化跨平台财务管理工具

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.1-black)](https://nextjs.org/)
[![Expo](https://img.shields.io/badge/Expo-54.0-blue)](https://expo.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-2.89-green)](https://supabase.com/)

## ✨ 特性

- 🔐 **安全认证** - Supabase Auth + OAuth (Google/GitHub)
- 💰 **多账户管理** - 银行卡、现金、支付宝、微信等
- 📊 **智能分类** - 22 个预设分类 + 自定义分类
- 📸 **OCR 识别** - AI 驱动的票据识别（计划中）
- 🔄 **实时同步** - Supabase Realtime 多端数据即时同步
- 📱 **跨平台** - Web + iOS + Android
- 🎨 **现代 UI** - 玻璃态设计 + 深色模式

## 🚀 快速开始

### 前置要求

- Node.js 20+
- pnpm 9+ (`npm install -g pnpm`)
- Supabase 账户 (免费)

### 环境配置

1. **创建 Supabase 项目**
   - 访问 [Supabase Dashboard](https://supabase.com/dashboard)
   - 创建新项目
   - 获取项目 URL 和 anon key

2. **配置环境变量**
   ```bash
   # Web 端配置
   cp .env.example web/.env.local
   # 编辑 web/.env.local，填入你的 Supabase 配置

   # Mobile 端配置  
   cp .env.example app/.env
   # 编辑 app/.env，填入你的 Supabase 配置
   ```

3. **数据库设置**
   - 在 Supabase SQL Editor 中运行 `supabase-schema.sql`
   - 或使用项目中的 MCP 工具自动设置

### 方法一：使用启动脚本（推荐）

**Windows 用户：**
```bash
# 启动 Web 端
./start-dev.bat

# 启动 Mobile 端
./start-mobile.bat
```

### 方法二：手动安装

```bash
# 克隆项目
git clone <repository-url>
cd smart-wallet

# 安装依赖
pnpm install

# 配置环境变量（参考 .env.example）
cp .env.example web/.env.local
cp .env.example app/.env

# 启动 Web 端
pnpm --filter web dev

# 启动 Mobile 端
pnpm --filter app start
```

## 📚 文档

- **[完整项目指南](PROJECT_GUIDE.md)** - 详细的技术文档和使用指南
- **[开发计划](DEVELOPMENT_PLAN.md)** - 项目进度和开发路线图

## 🏗️ 技术栈

### 前端
- **Web**: Next.js 16.1 + React 19.2 + Tailwind CSS 4
- **Mobile**: Expo 54 + React Native 0.81
- **状态管理**: TanStack Query v5 + Zustand
- **类型安全**: TypeScript 5.9 (Strict Mode)

### 后端
- **BaaS**: Supabase (PostgreSQL + Auth + Realtime + Storage)
- **认证**: Supabase Auth
- **AI**: OpenAI GPT-4o + Google Gemini 3 Pro (计划中)

### 架构
- **Monorepo**: pnpm workspaces
- **共享代码**: packages/core (90% 代码复用)

## 📦 项目结构

```
smart-wallet/
├── packages/core/         # 共享核心包 ✅
├── web/                   # Next.js Web 应用 ✅
├── app/                   # Expo Mobile 应用 ✅
├── supabase-schema.sql    # 数据库脚本 ✅
└── pnpm-workspace.yaml    # pnpm 工作区配置 ✅
```

## 📊 项目进度

| 阶段 | 完成度 | 状态 |
|------|--------|------|
| Phase 1: 基础设施 | 100% | ✅ 完成 |
| Phase 2: 核心功能 | 100% | ✅ 完成 |
| Phase 3: 功能完善 | 0% | ⏳ 进行中 |
| **整体进度** | **65%** | 🟡 进行中 |

详见 [开发计划](DEVELOPMENT_PLAN.md)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

**Made with ❤️ using Next.js, Expo, and Supabase**
