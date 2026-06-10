# ChatALL 发布流程文档

## 1. 概述

本文档描述 ChatALL 项目的完整发布流程，包括环境配置、版本管理、CI/CD 流程、部署验证和回滚机制。

## 2. 环境配置

### 2.1 环境类型

| 环境 | 用途 | 分支 | 版本后缀 |
|------|------|------|----------|
| **development** | 开发环境 | `develop` | `-dev` |
| **staging** | 测试环境 | `staging` | `-staging` |
| **production** | 生产环境 | `main` | 无 |

### 2.2 环境配置文件

项目使用 `.env.{env}` 格式的环境配置文件：

- `.env.development` - 开发环境配置
- `.env.staging` - 测试环境配置  
- `.env.production` - 生产环境配置

### 2.3 环境变量管理

#### 2.3.1 变量分类

| 变量类型 | 示例 | 管理方式 |
|----------|------|----------|
| 公开配置 | `VUE_APP_NAME` | 代码仓库 |
| 敏感配置 | `VUE_APP_SECRET_KEY` | 加密存储 |
| 运行时配置 | `VUE_APP_API_BASE_URL` | CI/CD 注入 |

#### 2.3.2 敏感变量加密

使用 `scripts/env-manager.js` 工具管理敏感变量：

```bash
# 设置加密变量
node scripts/env-manager.js set-secret VUE_APP_SECRET_KEY "secret-value" production

# 获取解密变量
node scripts/env-manager.js get-secret VUE_APP_SECRET_KEY production
```

#### 2.3.3 CI/CD 变量注入

在 GitHub Actions 中通过 Secrets 管理敏感变量：

1. 进入 GitHub 仓库 → Settings → Secrets and variables → Actions
2. 添加 Repository Secrets
3. 在 workflow 中引用：`${{ secrets.SECRET_NAME }}`

## 3. 版本管理

### 3.1 版本号规范

遵循语义化版本 2.0.0：

```
MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]
```

### 3.2 版本升级规则

| 变更类型 | 版本升级 | 示例 |
|----------|----------|------|
| 不兼容 API 变更 | MAJOR | `1.86.8` → `2.0.0` |
| 新增功能 | MINOR | `1.86.8` → `1.87.0` |
| Bug 修复 | PATCH | `1.86.8` → `1.86.9` |
| 测试版本 | PRERELEASE | `1.87.0-beta.1` |

### 3.3 分支管理

```
main          # 生产代码（保护）
  ↓
develop       # 开发主分支（保护）
  ↓
feature/*     # 功能开发分支
bugfix/*      # Bug 修复分支
hotfix/*      # 紧急修复分支
release/*     # 发布准备分支
```

## 4. 发布流程

### 4.1 开发流程

```
1. 创建 feature 分支：git checkout -b feature/new-feature
2. 开发并提交代码
3. 推送到远程：git push origin feature/new-feature
4. 创建 Pull Request 到 develop
5. 代码审查通过后合并
6. 删除 feature 分支
```

### 4.2 Beta 发布流程

```
1. 从 develop 创建 release 分支：git checkout -b release/1.87.0-beta.1
2. 更新版本号至 1.87.0-beta.1
3. 更新 CHANGELOG.md
4. 运行测试：npm run test
5. 构建测试版本：npm run build
6. 发布到测试渠道
7. 收集反馈并修复问题
8. 合并回 develop
```

### 4.3 正式发布流程

```
1. 从 develop 创建 release 分支：git checkout -b release/1.87.0
2. 更新版本号至 1.87.0
3. 更新 CHANGELOG.md
4. 运行完整测试套件
5. 构建生产版本
6. 创建版本标签：git tag -a v1.87.0 -m "Release v1.87.0"
7. 推送标签：git push origin v1.87.0
8. 合并到 main 分支
9. CI/CD 自动部署到生产环境
10. 合并回 develop
```

### 4.4 紧急修复流程

```
1. 从 main 创建 hotfix 分支：git checkout -b hotfix/1.86.9
2. 修复问题
3. 更新版本号（PATCH + 1）
4. 更新 CHANGELOG.md
5. 运行测试
6. 合并到 main 和 develop
7. 创建标签并触发发布
```

## 5. CI/CD 流程

### 5.1 GitHub Actions 配置

#### 5.1.1 触发条件

| 事件 | 分支 | 操作 |
|------|------|------|
| `push` | `main` | 部署到生产环境 |
| `push` | `develop` | 部署到开发环境 |
| `push` | `staging` | 部署到测试环境 |
| `push` | `tags` | 创建 GitHub Release |

#### 5.1.2 工作流程

```yaml
name: Build and Release

on:
  push:
    tags:
      - "v*.*.*"

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - checkout
      - setup-node
      - install-dependencies
      - run-tests
      - build
      - upload-artifacts
  
  release:
    needs: build
    steps:
      - download-artifacts
      - create-release
```

### 5.2 部署步骤

#### 5.2.1 前端部署

```bash
# 安装依赖
npm ci

# 环境变量注入
cp .env.${ENV} .env

# 构建
npm run build

# 部署（示例：GitHub Pages）
npm run deploy
```

#### 5.2.2 Electron 构建

```bash
# 构建 macOS
npm run release-macos

# 构建 Linux
npm run release-linux

# 构建 Windows
npm run release-windows

# 构建所有平台
npm run release-all
```

## 6. 部署验证

### 6.1 验证脚本

#### 6.1.1 部署前验证

```bash
# 运行完整验证
node scripts/deploy-verify.js

# 包含构建检查
node scripts/deploy-verify.js --build

# 包含代码检查
node scripts/deploy-verify.js --lint --build
```

#### 6.1.2 健康检查

```bash
# 运行健康检查
node scripts/health-check.js

# 包含 API 健康检查
node scripts/health-check.js --check-api
```

### 6.2 验证内容

| 检查项 | 描述 | 工具 |
|--------|------|------|
| Node.js 版本 | 确认 >= 20 | deploy-verify |
| 依赖检查 | 确认关键依赖存在 | deploy-verify |
| 环境配置 | 确认必需变量设置 | deploy-verify |
| 构建验证 | 确认构建成功 | deploy-verify --build |
| 代码质量 | ESLint 检查 | deploy-verify --lint |
| 运行状态 | 服务健康检查 | health-check |

### 6.3 健康检查端点

应用应提供 `/health` 端点：

```json
{
  "status": "healthy",
  "version": "1.86.8",
  "timestamp": "2024-01-15T10:30:00Z",
  "checks": {
    "database": "healthy",
    "api": "healthy",
    "storage": "healthy"
  }
}
```

## 7. 回滚机制

### 7.1 回滚策略

| 场景 | 回滚方式 | 优先级 |
|------|----------|--------|
| 严重 Bug | 立即回滚到上一版本 | 高 |
| 功能不符合预期 | 回滚并重新发布 | 中 |
| 性能问题 | 评估后决定是否回滚 | 中 |
| 安全漏洞 | 立即下线并回滚 | 高 |

### 7.2 回滚流程

```
1. 确认问题严重程度
2. 通知相关团队（Slack/邮件）
3. 暂停新版本发布
4. 部署上一个稳定版本
5. 调查根本原因
6. 修复后重新发布
7. 更新文档和变更日志
```

### 7.3 回滚命令

```bash
# 回滚到上一个标签
git checkout v1.86.7

# 重新部署
npm run build
npm run deploy
```

## 8. 发布检查清单

### 8.1 发布前检查

- [ ] 所有测试通过
- [ ] 代码审查完成
- [ ] CHANGELOG.md 更新
- [ ] 版本号更新
- [ ] 环境配置验证
- [ ] 安全扫描通过
- [ ] 性能测试通过

### 8.2 发布后检查

- [ ] 部署成功通知
- [ ] 健康检查通过
- [ ] 功能验证完成
- [ ] 监控告警正常
- [ ] 用户反馈收集

## 9. 工具链

| 工具 | 用途 | 版本 |
|------|------|------|
| Vue CLI | 构建工具 | ^5.0.8 |
| Electron Builder | 桌面应用构建 | ^25.1.8 |
| GitHub Actions | CI/CD | - |
| ESLint | 代码检查 | ^8.57.1 |
| Prettier | 代码格式化 | ^3.5.3 |

## 10. 安全注意事项

1. **敏感变量不提交到仓库** - 使用 GitHub Secrets 管理
2. **加密配置文件** - 敏感配置使用 env-manager 加密
3. **代码审查** - 所有代码必须经过审查
4. **安全扫描** - 定期进行安全漏洞扫描
5. **最小权限原则** - CI/CD 使用最小权限令牌