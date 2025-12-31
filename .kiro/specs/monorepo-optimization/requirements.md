# Requirements Document - Monorepo 优化

## Introduction

当前项目采用了伪 Monorepo 结构，每个子项目（web, app, packages/core）都独立管理依赖，导致：
1. 依赖重复安装，占用大量磁盘空间
2. 版本不一致风险
3. 安装过程复杂，容易出错
4. 无法充分利用 Monorepo 的优势

本规范旨在将项目重构为真正的 Monorepo，实现依赖共享和统一管理。

## Glossary

- **Monorepo**: 单一代码仓库管理多个相关项目
- **Workspace**: 工作空间，Monorepo 中的子项目
- **Hoisting**: 依赖提升，将子项目的共同依赖提升到根目录
- **pnpm**: 高效的包管理器，原生支持 Monorepo
- **npm workspaces**: npm 的工作空间功能
- **Dependency Deduplication**: 依赖去重

## Requirements

### Requirement 1: 依赖共享与去重

**User Story:** 作为开发者，我希望项目中的共同依赖能够共享，避免重复安装，以节省磁盘空间和安装时间。

#### Acceptance Criteria

1. WHEN 多个子项目使用相同依赖时，THE System SHALL 将依赖提升到根目录
2. WHEN 安装依赖时，THE System SHALL 自动去重相同版本的包
3. WHEN 查看 node_modules 时，THE System SHALL 显示共享的依赖结构
4. THE System SHALL 支持不同子项目使用不同版本的依赖（当必要时）

### Requirement 2: 统一包管理

**User Story:** 作为开发者，我希望能够通过一个命令安装所有子项目的依赖，简化开发环境搭建。

#### Acceptance Criteria

1. WHEN 运行根目录安装命令时，THE System SHALL 自动安装所有子项目依赖
2. WHEN 添加新依赖时，THE System SHALL 支持指定安装到特定子项目
3. THE System SHALL 提供统一的脚本管理（dev, build, test）
4. THE System SHALL 支持并行执行多个子项目的命令

### Requirement 3: 版本一致性

**User Story:** 作为开发者，我希望确保所有子项目使用一致的依赖版本，避免版本冲突。

#### Acceptance Criteria

1. WHEN 多个子项目依赖同一个包时，THE System SHALL 使用相同版本
2. WHEN 存在版本冲突时，THE System SHALL 提供明确的错误信息
3. THE System SHALL 支持锁定文件（lock file）确保版本一致性
4. THE System SHALL 提供依赖版本检查工具

### Requirement 4: 开发体验优化

**User Story:** 作为开发者，我希望 Monorepo 工具能够提供良好的开发体验，包括快速安装、智能缓存等。

#### Acceptance Criteria

1. WHEN 安装依赖时，THE System SHALL 利用缓存加速安装过程
2. WHEN 修改一个子项目时，THE System SHALL 只重新构建受影响的项目
3. THE System SHALL 支持符号链接（symlink）实现包之间的引用
4. THE System SHALL 提供清晰的依赖关系图

### Requirement 5: 跨平台兼容性

**User Story:** 作为开发者，我希望 Monorepo 解决方案能够在 Windows、macOS、Linux 上正常工作。

#### Acceptance Criteria

1. WHEN 在 Windows 上使用时，THE System SHALL 正确处理符号链接
2. WHEN 在不同操作系统间切换时，THE System SHALL 保持一致的行为
3. THE System SHALL 避免路径长度限制问题（Windows）
4. THE System SHALL 支持不同操作系统的包管理器特性

### Requirement 6: 工具选择评估

**User Story:** 作为技术决策者，我希望选择最适合项目需求的 Monorepo 工具。

#### Acceptance Criteria

1. THE Evaluation SHALL 比较 npm workspaces、pnpm、yarn workspaces 的优缺点
2. THE Evaluation SHALL 考虑 Windows 兼容性问题
3. THE Evaluation SHALL 评估迁移成本和风险
4. THE Evaluation SHALL 提供具体的实施方案

### Requirement 7: 渐进式迁移

**User Story:** 作为开发者，我希望能够渐进式地迁移到真正的 Monorepo，避免破坏现有功能。

#### Acceptance Criteria

1. WHEN 开始迁移时，THE System SHALL 保持现有功能正常工作
2. WHEN 迁移过程中出现问题时，THE System SHALL 支持快速回滚
3. THE Migration SHALL 提供详细的迁移步骤和验证方法
4. THE Migration SHALL 包含完整的测试计划

### Requirement 8: 性能优化

**User Story:** 作为开发者，我希望 Monorepo 能够提供比当前方案更好的性能。

#### Acceptance Criteria

1. WHEN 安装依赖时，THE System SHALL 比当前方案更快
2. WHEN 构建项目时，THE System SHALL 支持增量构建
3. THE System SHALL 减少磁盘空间占用
4. THE System SHALL 提供并行处理能力

## Technical Constraints

1. 必须支持 Next.js 16.1.0 和 Expo 54
2. 必须保持与 TypeScript 5 的兼容性
3. 必须支持 Windows 开发环境
4. 必须保持与现有 Insforge 集成的兼容性
5. 必须支持本地包引用（packages/core）

## Success Criteria

1. 单一命令安装所有依赖
2. 依赖去重率 > 80%
3. 安装时间减少 > 50%
4. 磁盘空间占用减少 > 60%
5. 零破坏性变更（现有功能正常）
6. 支持所有主流操作系统