# 🚀 Smart Wallet - 5 分钟快速开始

## 前置要求

- Node.js 20+
- pnpm 9+ (`npm install -g pnpm`)

## 步骤 1: 安装依赖（2 分钟）

### 方法 1: 自动安装（推荐）

```bash
# Windows PowerShell
.\install.ps1
```

### 方法 2: 手动安装

```bash
# 克隆项目
git clone <repository-url>
cd smart-wallet

# 安装根目录依赖
pnpm install

# 安装 Web 端依赖
pnpm --filter web install

# 安装 Mobile 端依赖
pnpm --filter app install
```

## 步骤 2: 数据库设置（重要！）

**⚠️ 必须先执行此步骤，否则注册功能无法正常工作**

### 执行数据库脚本

```bash
# Windows PowerShell（推荐）
.\execute-credentials-table.ps1

# 或使用批处理文件
.\execute-credentials-table.bat
```

### 手动执行步骤

1. 打开 [InsForge Dashboard](https://dashboard.insforge.app)
2. 登录您的账户
3. 进入项目 (4mam7f8a)
4. 点击左侧菜单的 "SQL Editor"
5. 复制 `insforge-user-credentials.sql` 文件内容
6. 粘贴到 SQL 编辑器中
7. 点击 "Run" 按钮执行

### 验证数据库设置

执行成功后，您应该看到：
- `user_credentials` 表已创建
- 相关索引已创建
- 触发器已设置

## 步骤 3: 配置环境变量（2 分钟）

### Web 端 (`web/.env.local`)

```bash
# 复制示例文件
cp .env.example web/.env.local
```

编辑 `web/.env.local`，**必须修改** `NEXTAUTH_SECRET`：

```env
# InsForge 配置（已配置好，无需修改）
NEXT_PUBLIC_INSFORGE_BASE_URL=https://4mam7f8a.ap-southeast.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=ik_b9de652d8b5427aa7609072413282e4d

# NextAuth 配置（必须修改）
NEXTAUTH_SECRET=<生成的密钥>
NEXTAUTH_URL=http://localhost:3000
```

**生成 NEXTAUTH_SECRET:**

```bash
# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Linux/Mac
openssl rand -base64 32
```

### Mobile 端 (`app/.env`)

```bash
# 创建文件
echo "EXPO_PUBLIC_INSFORGE_BASE_URL=https://4mam7f8a.ap-southeast.insforge.app" > app/.env
echo "EXPO_PUBLIC_INSFORGE_ANON_KEY=ik_b9de652d8b5427aa7609072413282e4d" >> app/.env
```

## 步骤 4: 启动开发服务器（1 分钟）

### Web 端

```bash
# 方法 1: 使用 pnpm filter（推荐）
pnpm --filter web dev

# 方法 2: 直接在 web 目录运行
cd web && pnpm dev

# 访问 http://localhost:3000
```

### Mobile 端

```bash
pnpm --filter app start
# 或
cd app && pnpm start

# 扫描二维码或按 'i' (iOS) / 'a' (Android)
```

## 🎉 完成！

现在你可以：

1. **访问 Web 应用** - http://localhost:3000/dashboard
2. **查看系统分类** - 22 个预设分类已就绪
3. **添加账户** - 点击"+ 添加账户"
4. **记录交易** - 点击"+ 记一笔"
5. **体验实时同步** - 在多个浏览器窗口测试

## 📚 下一步

- 查看 [完整项目指南](PROJECT_GUIDE.md) - 详细的技术文档
- 查看 [开发计划](DEVELOPMENT_PLAN.md) - 项目进度和路线图
- 查看 [README.md](README.md) - 项目概览

## 🐛 遇到问题？

### Q: pnpm install 失败
**A:** 确保使用 pnpm 9+，分别安装各个包：
```bash
pnpm install                    # 根目录
pnpm --filter web install      # Web 端
pnpm --filter app install      # Mobile 端
```

### Q: 'next' 不是内部或外部命令
**A:** Web 端依赖没有正确安装，运行：
```bash
pnpm --filter web install
```

### Q: Module not found: Can't resolve '@smart-wallet/core'
**A:** Workspace 链接问题，确保已创建 pnpm-workspace.yaml 并重新安装：
```bash
pnpm install
```

### Q: React Hook 在服务器组件中使用错误
**A:** 这是正常的，已经修复。确保使用最新的代码。

### Q: 注册时提示 "Could not find the 'email_verified' column"
**A:** 数据库缺少用户凭据表，请执行：
```bash
.\execute-credentials-table.ps1
```
然后按照提示在 InsForge Dashboard 中执行 SQL 脚本。

### Q: 注册时提示 "数据库配置错误：缺少用户凭据表"
**A:** 同上，需要先执行数据库设置脚本。

### Q: TypeScript 找不到 smart-wallet-core
**A:** 确保已运行 `pnpm install`，pnpm 会自动处理 workspace 链接

### Q: 端口被占用
**A:** 修改 `web/.env.local` 中的 `PORT` 或使用其他端口：
```bash
PORT=3001 pnpm --filter web dev
```

---

**准备好了吗？开始构建你的智能钱包吧！** 💰✨
