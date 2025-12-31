GitHub 上传指南

## 🔐 上传前的安全检查

### ✅ 已完成的安全措施
1. **创建了 .gitignore** - 保护敏感文件不被上传
2. **环境变量保护** - `.env.local` 和 `.env` 文件已被忽略
3. **敏感文档过滤** - 调试文档和凭据文件已被忽略

### ⚠️ 重要提醒
- **绝对不要上传真实的 Supabase 密钥**
- **检查所有文件确保没有硬编码的密码或 API 密钥**
- **使用 .env.example 作为配置模板**

## 🚀 上传步骤

### 1. 初始化 Git 仓库
```bash
git init
```

### 2. 添加文件到 Git
```bash
# 添加所有文件（.gitignore 会自动过滤敏感文件）
git add .

# 检查哪些文件将被提交
git status
```

### 3. 创建首次提交
```bash
git commit -m "🎉 Initial commit: Smart Wallet 跨端智能记账应用

✨ Features:
- 🔐 Supabase 认证系统
- 💰 多账户财务管理
- 📱 Next.js Web + Expo Mobile
- 🎨 现代玻璃态 UI 设计
- 🔄 实时数据同步

🏗️ Tech Stack:
- Frontend: Next.js 16.1 + Expo 54
- Backend: Supabase (PostgreSQL + Auth + Realtime)
- Language: TypeScript 5.9
- Architecture: Monorepo with shared core package"
```

### 4. 在 GitHub 创建仓库
1. 访问 [GitHub](https://github.com)
2. 点击右上角的 "+" → "New repository"
3. 填写仓库信息：
   - **Repository name**: `smart-wallet` (或你喜欢的名字)
   - **Description**: `🏦 跨端智能记账应用 - Next.js + Expo + Supabase`
   - **Visibility**: 选择 Public 或 Private
   - **不要**勾选 "Add a README file"（我们已经有了）

### 5. 连接本地仓库到 GitHub
```bash
# 添加远程仓库（替换为你的 GitHub 用户名和仓库名）
git remote add origin https://github.com/zhouwei-jazz/smart-wallet.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

## 📋 上传前检查清单

### ✅ 必须检查的项目
- [ ] `.gitignore` 文件存在且包含敏感文件
- [ ] 没有 `.env.local` 或 `.env` 文件被添加到 Git
- [ ] `README.md` 已更新为 Supabase 版本
- [ ] 所有调试文档（`*DEBUG*.md`）已被忽略
- [ ] 数据库凭据文件已被忽略

### 🔍 手动检查命令
```bash
# 查看将要提交的文件
git status

# 查看被忽略的文件
git status --ignored

# 确保敏感文件被忽略
git check-ignore web/.env.local app/.env
```

## 🎯 推荐的仓库设置

### 仓库描述
```
🏦 跨端智能记账应用 - 基于 Next.js + Expo + Supabase 的现代化财务管理工具
```

### 标签 (Topics)
```
nextjs, expo, supabase, typescript, react, react-native, monorepo, finance, wallet, pnpm
```

### README 徽章
项目已包含以下徽章：
- MIT License
- TypeScript 5.9
- Next.js 16.1
- Expo 54.0
- Supabase 2.89

## 🔄 后续维护

### 定期更新
```bash
# 添加新更改
git add .
git commit -m "✨ Add new feature: [描述]"
git push
```

### 分支管理
```bash
# 创建功能分支
git checkout -b feature/new-feature

# 合并到主分支
git checkout main
git merge feature/new-feature
git push
```

## 🛡️ 安全最佳实践

1. **永远不要提交**：
   - 真实的 API 密钥
   - 数据库密码
   - 私钥文件
   - 用户数据

2. **使用环境变量**：
   - 所有敏感配置都通过环境变量
   - 提供 `.env.example` 作为模板

3. **定期检查**：
   - 使用 `git log --oneline` 检查提交历史
   - 确保没有意外提交敏感信息

## 🎉 完成！

上传完成后，你的项目将在 GitHub 上可见：
`https://github.com/YOUR_USERNAME/smart-wallet`

其他开发者可以通过以下方式克隆和运行：
```bash
git clone https://github.com/YOUR_USERNAME/smart-wallet.git
cd smart-wallet
pnpm install
# 配置环境变量后
pnpm --filter web dev    # Web 端
pnpm --filter app start  # Mobile 端
```