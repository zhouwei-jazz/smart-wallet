# Smart Wallet - InsForge 认证系统集成指南

> 基于 InsForge 官方认证解决方案的完整实现

## 🎯 概述

Smart Wallet 现已完全集成 InsForge 官方认证系统，提供现代化、安全的用户认证体验。支持 Web 和 Mobile 双端，具备完整的 UI 组件和状态管理。

## 🏗️ 架构设计

### 技术栈
- **Web**: `@insforge/react` + Next.js 16
- **Mobile**: `@insforge/react` + Expo Router
- **状态管理**: InsForge 内置 hooks
- **UI 设计**: 现代 Glassmorphism 风格

### 核心组件
```typescript
// 认证状态组件
<SignedIn>...</SignedIn>
<SignedOut>...</SignedOut>

// 认证按钮
<SignInButton mode="modal">...</SignInButton>
<SignUpButton mode="modal">...</SignUpButton>

// 用户组件
<UserButton />

// Hooks
const { isSignedIn, isLoaded } = useAuth();
const { user, isLoaded } = useUser();
```

## 📱 Web 端实现

### 1. Provider 配置
```typescript
// web/components/providers/insforge-provider.tsx
<InsforgeProvider baseUrl={process.env.NEXT_PUBLIC_INSFORGE_BASE_URL}>
  {children}
</InsforgeProvider>
```

### 2. 登录页面
- **路径**: `/login`
- **特性**: 
  - 现代化 UI 设计
  - 密码显示/隐藏切换
  - OAuth 按钮（GitHub, Google）
  - 自动重定向到 Dashboard
  - 错误处理和成功提示

### 3. 注册页面
- **路径**: `/register`
- **特性**:
  - 表单验证
  - 密码确认
  - 服务条款链接
  - 邮箱验证流程

### 4. Dashboard 集成
```typescript
// 自动保护路由
<SignedOut>
  {redirect('/login')}
</SignedOut>

<SignedIn>
  <UserButton /> // 用户头像和菜单
  {/* Dashboard 内容 */}
</SignedIn>
```

## 📱 Mobile 端实现

### 1. Provider 配置
```typescript
// app/components/providers/insforge-provider.tsx
<InsforgeProvider baseUrl={process.env.EXPO_PUBLIC_INSFORGE_BASE_URL}>
  {children}
</InsforgeProvider>
```

### 2. 认证页面
- **登录**: `app/(auth)/login.tsx`
- **注册**: `app/(auth)/register.tsx`
- **特性**:
  - 触摸友好的 UI
  - 键盘自适应
  - 原生样式设计
  - 状态管理

### 3. Profile 页面集成
```typescript
<SignedOut>
  {/* 引导用户登录 */}
</SignedOut>

<SignedIn>
  <UserButton /> // 用户头像
  {/* 用户统计和设置 */}
</SignedIn>
```

## 🔧 环境配置

### Web 端 (.env.local)
```bash
# InsForge 配置
VITE_INSFORGE_BASE_URL=https://4mam7f8a.ap-southeast.insforge.app
VITE_INSFORGE_ANON_KEY=ik_b9de652d8b5427aa7609072413282e4d

# Next.js 兼容
NEXT_PUBLIC_INSFORGE_BASE_URL=https://4mam7f8a.ap-southeast.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=ik_b9de652d8b5427aa7609072413282e4d
```

### Mobile 端 (.env)
```bash
# InsForge 配置
EXPO_PUBLIC_INSFORGE_BASE_URL=https://4mam7f8a.ap-southeast.insforge.app
EXPO_PUBLIC_INSFORGE_ANON_KEY=ik_b9de652d8b5427aa7609072413282e4d
```

## 🎨 UI 设计特色

### 设计风格
- **Glassmorphism**: 毛玻璃效果
- **深色主题**: 专业现代感
- **渐变边框**: 科技感边框
- **动画过渡**: 流畅的状态切换

### 颜色方案
```css
--bg-primary: #0f172a (slate-950)
--bg-card: rgba(255, 255, 255, 0.05)
--border: rgba(255, 255, 255, 0.1)
--accent: #0ea5e9 (sky-500)
--text-primary: #ffffff
--text-secondary: #94a3b8
```

### 响应式设计
- **Web**: 桌面优化，支持键盘导航
- **Mobile**: 触摸优化，适配不同屏幕尺寸

## 🔐 安全特性

### 认证流程
1. **注册**: InsForge 内置注册 → 邮箱验证
2. **登录**: 凭据验证 → JWT Token
3. **会话**: 自动刷新 Token
4. **登出**: 清除本地状态

### 数据保护
- **密码加密**: InsForge 内置加密
- **Token 管理**: 自动过期和刷新
- **HTTPS**: 强制加密传输
- **CORS**: 跨域请求保护

## 🚀 使用方法

### 启动开发服务器

**Web 端**:
```bash
cd web
pnpm dev
# 访问: http://localhost:3000
```

**Mobile 端**:
```bash
cd app
npx expo start
# 扫码或使用模拟器
```

### 测试认证流程

1. **注册新用户**:
   - 访问 `/register` 或 Mobile 注册页面
   - 填写用户信息
   - 检查邮箱验证链接

2. **登录测试**:
   - 使用注册的邮箱和密码
   - 验证自动跳转到 Dashboard
   - 测试用户状态持久化

3. **跨端同步**:
   - 在一端登录
   - 验证另一端的状态同步

## 📊 功能对比

| 功能 | Web 端 | Mobile 端 | 状态 |
|------|--------|-----------|------|
| 用户注册 | ✅ | ✅ | 完成 |
| 用户登录 | ✅ | ✅ | 完成 |
| 邮箱验证 | ✅ | ✅ | 完成 |
| OAuth 登录 | ✅ | ✅ | 完成 |
| 用户头像 | ✅ | ✅ | 完成 |
| 状态管理 | ✅ | ✅ | 完成 |
| 自动跳转 | ✅ | ✅ | 完成 |
| 错误处理 | ✅ | ✅ | 完成 |

## 🎉 完成状态

### ✅ 已完成
- [x] InsForge React 包集成
- [x] 现代化认证 UI
- [x] 完整的状态管理
- [x] 跨端认证同步
- [x] 用户体验优化
- [x] 安全性保障

### 🚀 项目已就绪
Smart Wallet 的 InsForge 认证系统已完全实现，可以投入生产使用。用户可以在 Web 和 Mobile 端享受一致、安全、现代的认证体验。

---

**技术支持**: 如有问题，请参考 InsForge 官方文档或联系开发团队。