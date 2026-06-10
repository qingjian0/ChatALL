# ChatALL Web 安全监控与请求签名审计清单

## 一、请求签名方案

### A. HMAC 签名机制

| 检查项 | 状态 | 描述 |
|--------|------|------|
| SHA-256 算法 | ✅ | 使用 Web Crypto API 的 SHA-256 进行签名 |
| 时间戳防重放 | ✅ | 5分钟有效期验证 |
| 随机 Nonce | ✅ | 16字节随机数，防止重复请求 |
| Nonce 缓存 | ✅ | 最多缓存1000个，自动清理过期 |

### B. 签名流程

```
请求参数(排序) + timestamp + nonce → HMAC-SHA256 → signature
```

### C. 验证流程

| 验证步骤 | 实现 |
|----------|------|
| 签名有效性 | 重新计算签名并对比 |
| 时间戳新鲜度 | 检查是否在5分钟内 |
| Nonce 唯一性 | 查询缓存，已存在则拒绝 |

---

## 二、安全监控体系

### A. 异常检测

| 检测类型 | 阈值 | 处理方式 |
|----------|------|----------|
| 暴力破解 | 5次/5分钟 | 触发告警 |
| 速率限制 | 100次/分钟 | 返回429 |
| API Key 泄露 | 检测到敏感模式 | 触发告警 |
| 异常请求模式 | 异常请求分布 | 记录并分析 |

### B. 日志监控

| 功能 | 实现 |
|------|------|
| 安全事件日志 | 记录所有安全相关事件 |
| 错误上报脱敏 | 自动屏蔽敏感信息 |
| 用户行为分析 | 追踪关键操作 |

### C. Sentry 集成

| 功能 | 状态 |
|------|------|
| 错误追踪 | ✅ | 支持手动启用 |
| 性能监控 | ✅ | 通过 Sentry SDK |
| 用户会话回放 | ⏳ | 待集成 |

---

## 三、CORS 代理安全

### A. 来源验证

| 验证项 | 实现 |
|--------|------|
| Origin 白名单 | ✅ | 支持通配符匹配 |
| Referer 验证 | ⚠️ | 仅警告，不阻止 |
| 域名黑名单 | ✅ | 主动阻止恶意域名 |

### B. 请求限制

| 限制类型 | 默认值 | 可配置 |
|----------|--------|--------|
| 速率限制 | 100次/分钟 | ✅ |
| 请求大小 | 10MB | ✅ |
| 请求方法 | GET/POST/PUT/DELETE/OPTIONS/PATCH | ✅ |

### C. 安全日志

| 功能 | 实现 |
|------|------|
| 记录所有请求 | ✅ | 保留最近1000条 |
| 异常请求告警 | ✅ | 自动触发安全监控 |

---

## 四、安全审计清单

### 开发阶段检查

| 检查项 | 状态 | 责任人 |
|--------|------|--------|
| API Key 使用 secureStorage 存储 | ✅ | 开发者 |
| 日志输出使用 logSanitizer 包装 | ✅ | 开发者 |
| 请求签名验证集成 | ✅ | 开发者 |
| CORS 白名单配置正确 | ✅ | 开发者 |
| 敏感数据不明文存储 | ✅ | 开发者 |

### 部署阶段检查

| 检查项 | 状态 | 责任人 |
|--------|------|--------|
| HTTPS 启用 | ✅ | 运维 |
| CSP 配置 | ⏳ | 运维 |
| 安全响应头 | ⏳ | 运维 |
| Sentry 监控 | ✅ | 运维 |
| 日志审计开启 | ✅ | 运维 |

### 运维阶段检查

| 检查项 | 频率 | 责任人 |
|--------|------|--------|
| 异常事件监控 | 实时 | 运维 |
| 安全日志审查 | 每日 | 安全团队 |
| 依赖安全扫描 | 每周 | 安全团队 |
| 安全策略更新 | 每月 | 安全团队 |
| 应急响应演练 | 季度 | 安全团队 |

---

## 五、代码文件结构

```
src/
└── security/
    ├── index.js              # 主安全 API 入口
    ├── secureStorage.js      # Web Crypto 加密实现
    ├── passwordManager.js    # 内存密码管理
    ├── logSanitizer.js       # 日志脱敏工具
    ├── requestSigner.js      # 请求签名器（新增）
    ├── securityMonitor.js    # 安全监控器（新增）
    └── corsProxy.js          # CORS 代理安全（新增）
```

---

## 六、API 接口汇总

### requestSigner API

| 方法 | 参数 | 返回值 | 描述 |
|------|------|--------|------|
| `signRequest(params, apiSecret)` | 参数对象, 密钥 | Promise<{params, signature, timestamp, nonce}> | 生成请求签名 |
| `verifySignature(signature, params, apiSecret, timestamp, nonce)` | 签名, 参数, 密钥, 时间戳, 随机数 | Promise<boolean> | 验证签名 |
| `generateNonce()` | 无 | string | 生成随机 nonce |
| `generateApiKey()` | 无 | string | 生成随机 API Key |
| `validateApiKey(apiKey)` | API Key | boolean | 验证 API Key 格式 |

### securityMonitor API

| 方法 | 参数 | 描述 |
|------|------|------|
| `trackRequest(requestInfo)` | 请求信息对象 | 追踪请求 |
| `trackFailedAuth(apiKeyHash, ipAddress)` | API Key 哈希, IP | 记录失败认证 |
| `reportAnomaly(anomaly)` | 异常对象 | 报告安全异常 |
| `getSecurityReport()` | 无 | 获取安全报告 |
| `enableSentry()` | 无 | 启用 Sentry |
| `disableSentry()` | 无 | 禁用 Sentry |

### corsProxy API

| 方法 | 参数 | 返回值 | 描述 |
|------|------|--------|------|
| `validateRequest(request)` | 请求对象 | {valid, errors, warnings, rateLimit} | 验证请求 |
| `setWhitelist(origins)` | 域名数组 | 无 | 设置白名单 |
| `addOrigin(origin)` | 域名 | boolean | 添加域名 |
| `blockOrigin(origin)` | 域名 | 无 | 阻止域名 |
| `getProxyStats()` | 无 | 统计对象 | 获取统计信息 |
| `setRateLimit(limit, windowMs)` | 限制数, 窗口时间 | 无 | 设置速率限制 |

---

## 七、安全最佳实践

1. **密钥管理**: 使用 secureStorage 加密存储所有 API Key
2. **签名验证**: 所有对外 API 请求必须进行签名验证
3. **日志脱敏**: 确保日志中不包含敏感信息
4. **异常监控**: 实时监控异常事件并及时告警
5. **依赖安全**: 定期更新依赖，关注安全公告
6. **最小权限**: 遵循最小权限原则分配访问权限
7. **应急响应**: 建立完善的安全事件响应流程