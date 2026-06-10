# ChatALL API Key 安全存储方案

## 一、安全威胁分析

### 威胁矩阵

| 威胁类型 | 风险等级 | 描述 | 缓解措施 |
|---------|---------|------|---------|
| XSS 攻击 | 高 | 恶意脚本窃取内存中的敏感数据 | 日志脱敏、内容安全策略 |
| 浏览器扩展窃取 | 高 | 恶意扩展读取 localStorage | 加密存储、短时内存缓存 |
| 内存 Dump | 中 | 进程内存被转储分析 | 自动锁定、内存清理 |
| 物理访问 | 中 | 设备被盗导致数据泄露 | 加密存储、主密码保护 |
| 网络嗅探 | 低 | HTTPS 已保护传输层 | HTTPS 强制 |
| 内部人员攻击 | 中 | 开发人员/运维人员访问 | 最小权限原则 |

### 敏感数据识别

以下字段被识别为敏感数据，需要加密存储：
- `apiKey` - 各类 API 密钥
- `azureApiKey` - Azure API 密钥
- `token` - 访问令牌
- `access_token` - OAuth 访问令牌
- `refresh_token` - OAuth 刷新令牌
- `secretKey` - 密钥
- `xsrfToken` - CSRF 令牌
- `inviteToken` - 邀请令牌
- `formkey` - 表单密钥

---

## 二、加密方案设计

### A. Web Crypto API 实现

```javascript
// 加密参数配置
ENCRYPTION_ALGORITHM = "AES-GCM"
KEY_DERIVATION_ALGORITHM = "PBKDF2"
HASH_ALGORITHM = "SHA-256"
ITERATIONS = 100000
KEY_LENGTH = 256
```

### B. 加密存储流程

```
用户输入密码
    ↓
PBKDF2 密钥派生 (100000次迭代)
    ↓
生成随机 Salt (16字节)
    ↓
生成随机 IV (12字节)
    ↓
AES-256-GCM 加密
    ↓
存储到 localStorage (加密后数据 + salt + iv)
```

### C. 内存密码管理器

| 特性 | 实现 |
|------|------|
| 自动锁定 | 5分钟无操作自动锁定 |
| 页面隐藏 | 标签页切换时立即清除密码 |
| 页面关闭 | beforeunload 时清除密码 |
| 事件监听 | visibilitychange, blur, beforeunload |
| 状态通知 | 支持订阅锁定/解锁事件 |

---

## 三、安全 API 设计

### secureStorage API

| 方法 | 参数 | 返回值 | 描述 |
|------|------|--------|------|
| `set(key, value, password?)` | `key`: 存储键名<br>`value`: 明文值<br>`password`: 可选密码 | `Promise<encryptedObject>` | 加密并存储值 |
| `get(key, password?)` | `key`: 存储键名<br>`password`: 可选密码 | `Promise<string>` | 解密并返回值 |
| `remove(key)` | `key`: 存储键名 | `Promise<void>` | 删除指定键 |
| `clearAll()` | 无 | `Promise<void>` | 清空所有存储 |
| `has(key)` | `key`: 存储键名 | `Promise<boolean>` | 检查键是否存在 |
| `keys()` | 无 | `Promise<string[]>` | 获取所有键名 |

### passwordManager API

| 方法 | 参数 | 返回值 | 描述 |
|------|------|--------|------|
| `setPassword(password)` | `password`: 用户密码 | `void` | 设置当前会话密码 |
| `getPassword()` | 无 | `string` | 获取密码（锁定时抛出异常） |
| `clearPassword()` | 无 | `void` | 清除密码，锁定保险箱 |
| `isVaultLocked()` | 无 | `boolean` | 检查保险箱状态 |
| `getTimeRemaining()` | 无 | `number` | 获取剩余秒数 |
| `addListener(listener)` | `listener`: 回调函数 | `void` | 订阅锁定/解锁事件 |
| `removeListener(listener)` | `listener`: 回调函数 | `void` | 取消订阅 |

### logSanitizer API

| 方法 | 参数 | 描述 |
|------|------|------|
| `log(...args)` | 任意参数 | 安全日志输出 |
| `logError(...args)` | 任意参数 | 安全错误日志 |
| `logWarn(...args)` | 任意参数 | 安全警告日志 |
| `logInfo(...args)` | 任意参数 | 安全信息日志 |
| `sanitizeLog(data)` | `data`: 任意数据 | 脱敏处理数据 |
| `captureError(error, context)` | `error`: 错误对象<br>`context`: 上下文 | 安全错误上报 |

---

## 四、安全检查清单

### 开发阶段检查

- [ ] 所有 API Key 字段使用 `secureStorage` 存储
- [ ] 日志输出使用 `logSanitizer` 包装
- [ ] 敏感数据不在 Vuex state 中明文存储
- [ ] 密码输入字段使用 `type="password"`
- [ ] 表单提交使用 HTTPS
- [ ] 避免在 console.log 中输出敏感数据
- [ ] 密码强度验证（最小长度 8 位，包含大小写和数字）

### 部署阶段检查

- [ ] 启用 HTTPS
- [ ] 配置 Content Security Policy (CSP)
- [ ] 设置 Secure 和 HttpOnly cookie 标志
- [ ] 配置 X-Frame-Options
- [ ] 配置 X-XSS-Protection
- [ ] 配置 X-Content-Type-Options

### 运维阶段检查

- [ ] 定期轮换加密密钥
- [ ] 监控异常登录尝试
- [ ] 定期安全审计
- [ ] 备份加密数据
- [ ] 安全事件响应流程

---

## 五、Vue Composition API 钩子

### useSecureStorage

```javascript
import { useSecureStorage } from "@/security/useSecureStorage";

const { value, isLoading, error, isLocked, saveValue } = useSecureStorage("openaiApi.apiKey");
```

### usePasswordManager

```javascript
import { usePasswordManager } from "@/security/useSecureStorage";

const { isLocked, timeRemaining, unlock, lock } = usePasswordManager();

await unlock("user-password");
lock();
```

---

## 六、文件结构

```
src/
└── security/
    ├── index.js          # 主安全 API 入口
    ├── secureStorage.js  # Web Crypto 加密实现
    ├── passwordManager.js # 内存密码管理
    ├── logSanitizer.js   # 日志脱敏工具
    └── useSecureStorage.js # Vue Composition API 钩子
```

---

## 七、迁移指南

### 从旧存储迁移到加密存储

```javascript
import { passwordManager, migrateToSecureStorage } from "@/security";

// 用户输入密码
passwordManager.setPassword(userPassword);

// 迁移现有数据
const results = await migrateToSecureStorage(store);

// 检查迁移结果
for (const result of results) {
  if (!result.migrated) {
    console.error(`Failed to migrate ${result.key}: ${result.error}`);
  }
}
```

---

## 八、安全最佳实践

1. **密码强度**: 强制要求密码长度 ≥ 8 位，包含大小写字母和数字
2. **会话管理**: 密码仅在内存中短暂存储，超时自动清除
3. **加密参数**: 使用高强度的 PBKDF2 迭代次数 (100000+)
4. **随机数**: 使用 `crypto.getRandomValues()` 生成随机数，避免使用 `Math.random()`
5. **错误处理**: 避免泄露敏感信息到错误消息中
6. **代码审计**: 定期进行安全代码审查
7. **依赖安全**: 定期更新依赖，关注安全公告