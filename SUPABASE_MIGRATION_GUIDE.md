# 🚀 InsForge 到 Supabase 迁移指南

## 迁移概览

本指南将帮助您将 Smart Wallet 项目从 InsForge 完全迁移到 Supabase，包括：

- ✅ 数据库架构迁移
- ✅ 认证系统更新
- ✅ Web 端代码更新
- ✅ Mobile 端代码更新
- ✅ 环境配置更新

## 步骤 1: 创建 Supabase 项目

### 1.1 注册 Supabase 账户
1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 使用 GitHub 或邮箱注册账户

### 1.2 创建新项目
1. 点击 "New Project"
2. 选择组织（或创建新组织）
3. 填写项目信息：
   - **项目名称**: `smart-wallet`
   - **数据库密码**: 设置强密码（请记住）
   - **区域**: 选择离您最近的区域
4. 点击 "Create new project"

### 1.3 获取项目配置信息
项目创建完成后，在 Settings > API 页面获取：
- **Project URL**: `https://your-project-id.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 步骤 2: 执行数据库迁移

### 2.1 创建数据库架构
1. 在 Supabase Dashboard 中，进入 SQL Editor
2. 复制 `supabase-schema.sql` 文件内容
3. 粘贴到 SQL Editor 并执行
4. 确认所有表和策略创建成功

### 2.2 验证数据库结构
执行以下 SQL 验证表是否创建成功：
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

应该看到以下表：
- `user_profiles`
- `accounts`
- `categories`
- `transactions`
- `budgets`

## 步骤 3: 更新环境配置

### 3.1 更新 Web 端环境变量
编辑 `web/.env.local`：
```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 服务端使用（可选）
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NextAuth 配置（保持不变）
NEXTAUTH_SECRET=your-existing-secret
NEXTAUTH_URL=http://localhost:3000
```

### 3.2 更新 Mobile 端环境变量
编辑 `app/.env`：
```env
# Supabase 配置
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 步骤 4: 配置 OAuth 提供商（可选）

### 4.1 GitHub OAuth
1. 在 Supabase Dashboard > Authentication > Providers
2. 启用 GitHub 提供商
3. 在 GitHub 创建 OAuth App：
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `https://your-project-id.supabase.co/auth/v1/callback`
4. 将 Client ID 和 Client Secret 填入 Supabase

### 4.2 Google OAuth
1. 在 Supabase Dashboard 启用 Google 提供商
2. 在 Google Cloud Console 创建 OAuth 2.0 凭据
3. 配置重定向 URI: `https://your-project-id.supabase.co/auth/v1/callback`
4. 将凭据填入 Supabase

## 步骤 5: 测试迁移

### 5.1 启动开发服务器
```bash
# Web 端
cd web
pnpm dev

# Mobile 端
cd app
pnpm start
```

### 5.2 测试认证功能
1. **注册测试**:
   - 访问 `/register`
   - 填写注册信息
   - 验证邮箱确认流程
   - 确认自动登录

2. **登录测试**:
   - 访问 `/login`
   - 使用注册的账户登录
   - 验证跳转到 dashboard

3. **OAuth 测试**:
   - 测试 GitHub 登录
   - 测试 Google 登录（如果配置）

### 5.3 测试数据库功能
1. 创建测试账户
2. 添加交易记录
3. 创建预算
4. 验证数据同步

## 步骤 6: 清理 InsForge 相关代码

### 6.1 删除 InsForge 依赖
```bash
# Web 端
cd web
pnpm remove @insforge/sdk @insforge/react bcryptjs @types/bcryptjs

# Mobile 端
cd app
# InsForge 依赖已在新代码中移除
```

### 6.2 删除 InsForge 相关文件
```bash
# 删除 InsForge 相关文件
rm -f insforge-*.sql
rm -f execute-credentials-table.*
rm -f DATABASE_SETUP.md
rm -f IMMEDIATE_ACTION_REQUIRED.md
rm -f web/lib/auth.ts
rm -f web/components/providers/auth-provider.tsx
rm -f web/app/api/auth/login/route.ts
rm -f web/app/api/auth/register/route.ts
```

### 6.3 更新 MCP 配置
编辑 `.kiro/settings/mcp.json`，移除 InsForge MCP 服务器配置。

## 步骤 7: 数据迁移（如果有现有数据）

### 7.1 导出 InsForge 数据
如果您在 InsForge 中有现有数据，需要：
1. 从 InsForge 导出数据（CSV 或 JSON 格式）
2. 转换数据格式以匹配 Supabase 架构
3. 使用 Supabase 的数据导入功能

### 7.2 创建默认分类
执行以下 SQL 创建默认分类：
```sql
INSERT INTO categories (name, type, icon, color, is_system) VALUES
-- 支出分类
('餐饮', 'expense', '🍽️', '#EF4444', true),
('交通', 'expense', '🚗', '#F59E0B', true),
('购物', 'expense', '🛍️', '#EC4899', true),
('娱乐', 'expense', '🎬', '#8B5CF6', true),
('医疗', 'expense', '🏥', '#06B6D4', true),
('教育', 'expense', '📚', '#10B981', true),
('住房', 'expense', '🏠', '#3B82F6', true),
('其他', 'expense', '📊', '#6B7280', true),

-- 收入分类
('工资', 'income', '💰', '#10B981', true),
('奖金', 'income', '🎁', '#F59E0B', true),
('投资', 'income', '📈', '#3B82F6', true),
('其他收入', 'income', '💵', '#6B7280', true);
```

## 步骤 8: 更新文档

### 8.1 更新项目文档
- 更新 README.md 中的后端信息
- 更新 QUICK_START.md 中的设置步骤
- 更新 PROJECT_GUIDE.md 中的技术栈信息

### 8.2 创建新的集成状态文档
创建 `SUPABASE_INTEGRATION_STATUS.md` 记录迁移状态。

## 🎉 迁移完成检查清单

- [ ] Supabase 项目创建完成
- [ ] 数据库架构执行成功
- [ ] 环境变量配置正确
- [ ] Web 端认证功能正常
- [ ] Mobile 端认证功能正常
- [ ] OAuth 登录正常（如果配置）
- [ ] 数据库操作正常
- [ ] 实时同步功能正常
- [ ] InsForge 相关代码清理完成
- [ ] 文档更新完成

## 🔧 故障排除

### 常见问题

**Q: 注册时提示邮箱验证**
A: 在 Supabase Dashboard > Authentication > Settings 中关闭 "Enable email confirmations"

**Q: OAuth 登录失败**
A: 检查 OAuth 应用的回调 URL 是否正确配置

**Q: 数据库连接失败**
A: 验证环境变量中的 URL 和 Key 是否正确

**Q: RLS 策略阻止数据访问**
A: 确保用户已登录，RLS 策略基于 `auth.uid()` 进行权限控制

## 🚀 迁移优势

迁移到 Supabase 后，您将获得：

- ✅ **更稳定的服务**: Supabase 是成熟的 BaaS 平台
- ✅ **更好的文档**: 完整的官方文档和社区支持
- ✅ **更多功能**: 实时订阅、边缘函数、存储等
- ✅ **更好的性能**: 基于 PostgreSQL 的高性能数据库
- ✅ **更灵活的认证**: 支持多种 OAuth 提供商
- ✅ **更好的开发体验**: 完整的 TypeScript 支持

---

**迁移完成后，您的 Smart Wallet 将运行在更稳定、更强大的 Supabase 平台上！** 🎉