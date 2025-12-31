# 数据库设置指南

## 问题描述

注册新用户时出现错误：
```
Could not find the 'email_verified' column of 'users' in the schema cache
```

## 原因

InsForge 的默认 `users` 表不包含密码存储字段，需要创建单独的 `user_credentials` 表来存储用户密码。

## 解决方案

### 方法 1: 使用自动化脚本（推荐）

```bash
# Windows PowerShell
.\execute-credentials-table.ps1

# Windows 批处理
.\execute-credentials-table.bat
```

### 方法 2: 手动执行

1. 打开 [InsForge Dashboard](https://dashboard.insforge.app)
2. 登录您的账户
3. 进入项目 (4mam7f8a)
4. 点击左侧菜单的 "SQL Editor"
5. 复制以下 SQL 代码并执行：

```sql
-- ============================================
-- Smart Wallet - User Credentials Table
-- 为用户名密码认证添加凭据表
-- ============================================

-- 创建用户凭据表来存储密码
CREATE TABLE IF NOT EXISTS user_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 确保每个用户只有一个凭据记录
    UNIQUE(user_id),
    UNIQUE(email)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_credentials_user_id ON user_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_user_credentials_email ON user_credentials(email);

-- 添加更新时间触发器
CREATE TRIGGER update_user_credentials_updated_at 
    BEFORE UPDATE ON user_credentials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 验证设置

执行成功后，您应该看到：
- ✅ `user_credentials` 表已创建
- ✅ 相关索引已创建  
- ✅ 更新时间触发器已设置

## 重启开发服务器

数据库设置完成后，重启 Web 开发服务器：

```bash
cd web
pnpm dev
```

## 测试注册功能

1. 访问 http://localhost:3000/register
2. 填写注册信息
3. 点击"创建账户"
4. 应该成功创建账户并自动登录

## 故障排除

### 如果仍然出现错误

1. **检查 SQL 执行结果**：确保没有错误信息
2. **刷新 InsForge 缓存**：在 Dashboard 中重新加载项目
3. **检查表是否存在**：在 SQL Editor 中运行 `SELECT * FROM user_credentials LIMIT 1;`
4. **重启开发服务器**：确保应用使用最新的数据库结构

### 常见问题

**Q: 执行 SQL 时提示权限错误**
A: 确保您是项目的管理员，或联系项目所有者执行

**Q: 表已存在但仍然报错**
A: 清除浏览器缓存并重启开发服务器

**Q: 注册成功但无法登录**
A: 检查 `user_credentials` 表中是否有对应记录

## 技术说明

### 为什么需要单独的凭据表？

1. **InsForge 默认设计**：主要用于 OAuth 认证，不存储密码
2. **安全考虑**：密码哈希与用户信息分离存储
3. **兼容性**：保持与 InsForge 原有结构的兼容性
4. **扩展性**：便于后续添加多因素认证等功能

### 表结构说明

- `user_id`: 关联到 `users` 表的外键
- `email`: 冗余存储，便于快速查询
- `password_hash`: bcrypt 加密的密码哈希
- `created_at/updated_at`: 时间戳字段

---

**完成设置后，您的 Smart Wallet 认证系统就可以正常工作了！** 🎉