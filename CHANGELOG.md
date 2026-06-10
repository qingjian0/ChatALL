# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- 支持 Gemini 2.0 Flash Lite 模型
- 新增 API 调用超时配置
- 添加应用启动时配置验证
- 新增环境变量管理工具

### Changed
- 优化对话列表渲染性能
- 更新依赖包版本

### Fixed
- 修复部分 AI 服务连接超时问题
- 修复深色模式下图标显示问题

---

## [1.86.8] - 2024-01-15

### Added
- 支持 Google Gemini 2.0 Flash 模型
- 添加对 Llama 4 系列模型的支持
- 新增快捷键指南功能

### Changed
- 优化消息列表虚拟滚动性能
- 更新安全监控配置

### Fixed
- 修复 Claude API 长时间请求超时问题
- 修复部分场景下消息重复显示问题

---

## [1.86.7] - 2024-01-08

### Added
- 支持 OpenAI o4-mini 模型
- 添加系统提示词自定义功能

### Changed
- 更新 LangChain 依赖版本

### Fixed
- 修复聊天记录导出格式问题
- 修复暗黑模式下部分组件样式问题

---

## [1.86.6] - 2023-12-28

### Added
- 支持 Grok 3 Mini 模型
- 添加消息搜索功能
- 新增代理配置界面

### Fixed
- 修复部分服务登录状态保持问题
- 修复窗口最小化后恢复显示问题

---

## [1.86.5] - 2023-12-20

### Added
- 支持 Qwen API 接口
- 添加会话管理功能
- 新增聊天记录备份与恢复

### Changed
- 优化应用启动速度
- 更新安全存储策略

### Fixed
- 修复 OAuth 登录流程问题
- 修复部分 AI 服务响应解析问题

---

## [1.86.0] - 2023-12-01

### Added
- 支持 Claude 3.7 Sonnet 模型
- 添加消息引用功能
- 新增多语言支持（德语、法语、意大利语）

### Changed
- 重构聊天消息存储架构
- 更新 UI 组件样式

### Deprecated
- 移除对旧版 API 的支持

### Fixed
- 修复消息发送失败重试问题
- 修复文件上传进度显示问题

---

## [1.85.0] - 2023-11-15

### Added
- 支持 Gemini 1.5 Pro API
- 添加消息编辑功能
- 新增快捷键支持

### Changed
- 更新依赖包版本
- 优化网络请求超时处理

### Fixed
- 修复夜间模式切换问题
- 修复部分服务认证问题

---

## [1.80.0] - 2023-10-01

### Added
- 支持 Claude 3 Opus/Sonnet/Haiku 模型
- 添加主题切换功能
- 新增深色模式

### Changed
- 重构安全模块
- 更新隐私政策

### Fixed
- 修复多个安全漏洞
- 修复内存泄漏问题

---

## [1.0.0] - 2023-01-01

### Added
- 初始版本发布
- 支持主流 AI 服务（ChatGPT, Claude, Bing, etc.）
- 多会话管理
- 消息导出功能
- 基本安全配置