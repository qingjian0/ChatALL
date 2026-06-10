# ChatALL 版本管理规范

## 1. 语义化版本控制

### 1.1 版本号格式

ChatALL 采用 **语义化版本 2.0.0** 规范，版本号格式为：

```
MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]
```

### 1.2 版本号规则

| 组件 | 含义 | 变更场景 |
|------|------|----------|
| **MAJOR** | 主版本号 | 不兼容的 API 变更、重大架构变更 |
| **MINOR** | 次版本号 | 向后兼容的功能新增、API 新增 |
| **PATCH** | 修订版本号 | 向后兼容的问题修复、小改进 |
| **PRERELEASE** | 预发布版本 | `-alpha.N`、`-beta.N`、`-rc.N` |
| **BUILD** | 构建元数据 | `+build.123`、`+git.hash` |

### 1.3 版本类型定义

| 类型 | 格式示例 | 使用场景 |
|------|----------|----------|
| Alpha | `1.0.0-alpha.1` | 内部测试版本，功能不完整 |
| Beta | `1.0.0-beta.1` | 公开测试版本，功能基本完整 |
| RC | `1.0.0-rc.1` | 候选发布版本，准备正式发布 |
| Stable | `1.0.0` | 正式稳定版本 |

---

## 2. 版本变更规则

### 2.1 何时升级主版本号 (MAJOR)

- 修改或移除现有的公共 API
- 数据库 schema 不兼容变更
- 重大架构重构
- 用户界面重大改版
- 配置文件格式不兼容变更

### 2.2 何时升级次版本号 (MINOR)

- 添加新功能或新组件
- 添加新的 API 端点
- 向后兼容的 API 变更
- 支持新的 AI 服务提供商
- 添加新的配置选项

### 2.3 何时升级修订号 (PATCH)

- 修复 bug
- 性能优化
- 安全补丁
- 文档更新
- 代码重构（不影响功能）
- 依赖版本升级（不影响 API）

---

## 3. 分支管理策略

### 3.1 分支类型

| 分支名称 | 用途 | 保护级别 |
|----------|------|----------|
| `main` | 生产环境代码 | **必须保护** |
| `develop` | 开发主分支 | **必须保护** |
| `release/*` | 发布准备分支 | 临时分支 |
| `feature/*` | 功能开发分支 | 普通分支 |
| `bugfix/*` | Bug 修复分支 | 普通分支 |
| `hotfix/*` | 紧急修复分支 | 普通分支 |

### 3.2 分支工作流程

```
feature/* -> develop -> release/* -> main
                              ^
                    hotfix/* --+
```

### 3.3 分支命名规范

- **功能分支**: `feature/feature-name`
- **Bug 修复**: `bugfix/bug-description`
- **紧急修复**: `hotfix/issue-description`
- **发布分支**: `release/x.y.z`

---

## 4. 版本标签规范

### 4.1 标签格式

```
v{MAJOR}.{MINOR}.{PATCH}
v{MAJOR}.{MINOR}.{PATCH}-{PRERELEASE}.{N}
```

### 4.2 标签示例

```bash
v1.86.8
v1.87.0-beta.1
v2.0.0-rc.1
```

### 4.3 标签创建流程

1. 在 `release/x.y.z` 分支上完成所有测试
2. 创建版本标签：`git tag -a vx.y.z -m "Release vx.y.z"`
3. 推送标签：`git push origin vx.y.z`

---

## 5. 变更日志管理

### 5.1 CHANGELOG 格式

遵循 [Keep a Changelog](https://keepachangelog.com/) 规范。

```markdown
## [Unreleased]

### Added
- 新增功能描述

### Changed
- 变更描述

### Deprecated
- 即将移除的功能

### Removed
- 已移除的功能

### Fixed
- Bug 修复描述

### Security
- 安全修复

## [1.86.8] - 2024-01-15

### Added
- 支持 Gemini 2.0 Flash 模型

### Fixed
- 修复 Claude API 超时问题
```

### 5.2 变更日志条目分类

| 分类 | 说明 |
|------|------|
| **Added** | 新增功能、API、配置项 |
| **Changed** | 现有功能的变更 |
| **Deprecated** | 标记为废弃的功能 |
| **Removed** | 已移除的功能 |
| **Fixed** | Bug 修复 |
| **Security** | 安全相关修复 |

---

## 6. 发布流程

### 6.1 Beta 发布流程

```
1. 从 develop 创建 release/x.y.z-beta.N 分支
2. 更新版本号至 x.y.z-beta.N
3. 更新 CHANGELOG.md
4. 运行自动化测试
5. 构建测试版本
6. 发布到测试渠道
7. 收集反馈并修复问题
8. 合并回 develop
```

### 6.2 正式发布流程

```
1. 从 develop 创建 release/x.y.z 分支
2. 更新版本号至 x.y.z
3. 更新 CHANGELOG.md
4. 运行完整测试套件
5. 构建生产版本
6. 创建版本标签 vx.y.z
7. 合并到 main 分支
8. 推送标签触发 CI/CD
9. 发布到正式渠道
10. 合并回 develop
```

### 6.3 紧急修复流程

```
1. 从 main 创建 hotfix/x.y.z 分支
2. 修复问题
3. 更新版本号（PATCH + 1）
4. 更新 CHANGELOG.md
5. 运行测试
6. 合并到 main 和 develop
7. 创建标签并发布
```

---

## 7. 回滚机制

### 7.1 回滚策略

| 场景 | 回滚方式 |
|------|----------|
| 发布后发现严重 bug | 回滚到上一个稳定版本 |
| 功能不符合预期 | 回滚代码并重新发布 |
| 安全漏洞 | 立即下线并回滚 |

### 7.2 回滚流程

```
1. 确认问题严重程度
2. 通知相关团队
3. 暂停新版本发布
4. 部署上一个稳定版本
5. 调查根本原因
6. 修复后重新发布
```

---

## 8. 版本管理工具

### 8.1 推荐工具

- **npm version**: 自动更新 package.json 版本号
- **standard-version**: 自动化版本管理和 CHANGELOG 生成
- **semantic-release**: 完全自动化的发布流程

### 8.2 npm version 使用

```bash
# 升级修订版本
npm version patch

# 升级次版本
npm version minor

# 升级主版本
npm version major

# 创建预发布版本
npm version prerelease --preid=beta
```

---

## 附录：版本号历史示例

```
v1.0.0          # 首个正式版本
v1.0.1          # 修复小 bug
v1.1.0          # 添加新功能
v1.1.1          # 修复功能相关 bug
v2.0.0-beta.1   # 2.0 版本 Beta 测试
v2.0.0-rc.1     # 2.0 版本候选发布
v2.0.0          # 2.0 正式版本
```