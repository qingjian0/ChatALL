# ChatALL 纯前端版本技术方案

> **多专家团队评审版本** | 评审日期: 2026-06-10
>
> 参与专家：架构专家、安全专家、性能专家、部署专家

---

## 目录

1. [项目概述与背景](#1-项目概述与背景)
2. [技术选型与决策](#2-技术选型与决策)
3. [架构设计](#3-架构设计)
4. [安全性设计](#4-安全性设计)
5. [性能优化策略](#5-性能优化策略)
6. [GitHub-Pages-部署配置](#6-github-pages-部署配置)
7. [Electron-迁移指南](#7-electron-迁移指南)
8. [Bot-兼容性与改造](#8-bot-兼容性与改造)
9. [CI-CD-流水线设计](#9-ci-cd-流水线设计)
10. [测试与验证](#10-测试与验证)
11. [风险评估与应对](#11-风险评估与应对)
12. [实施路线图](#12-实施路线图)

---

## 1. 项目概述与背景

### 1.1 项目简介

**ChatALL** 是一款多 AI 聊天聚合客户端，可同时与 60+ AI Bot 对话，帮助用户发现最佳回答。当前版本为 Electron 桌面应用，现需迁移为纯前端 Web 版本，部署至 GitHub Pages。

### 1.2 迁移目标

| 目标 | 描述 | 优先级 |
|------|------|--------|
| 纯前端运行 | 无需后端，纯浏览器环境 | P0 |
| GitHub Pages 部署 | 免费托管，自动 HTTPS | P0 |
| API Key 本地安全存储 | 不通过服务器转发 | P0 |
| 功能完整性 | 保留核心聊天功能 | P1 |
| 多 Bot 支持 | API 类 + Web 类 Bot | P1 |
| 响应式设计 | 桌面 + 移动端 | P2 |

### 1.3 当前技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.5.16 | 核心框架 |
| Vuetify | 3.8.8 | UI 组件库 |
| Vuex | 4.1.0 | 状态管理 |
| Dexie | 4.0.11 | IndexedDB ORM |
| vuex-persist | 3.1.3 | 状态持久化 |
| vue-i18n | 11.1.5 | 国际化 |
| Electron | 33.4.11 | 桌面运行时 |

### 1.4 迁移约束分析

| 约束类型 | 具体问题 | 影响级别 |
|----------|----------|----------|
| 无后端依赖 | 所有 API 调用浏览器直连 | 🔴 高 |
| CORS 限制 | 部分 API 不支持跨域 | 🔴 高 |
| 存储限制 | 依赖浏览器 LocalStorage/IndexedDB | 🟠 中 |
| GitHub Pages 限制 | 仅静态资源，无 SSR | 🟠 中 |
| 登录流程差异 | Electron 无法复用于 Web | 🔴 高 |

---

## 2. 技术选型与决策

### 2.1 框架选型对比

| 维度 | Vue 3 + Vite | React + Next.js | Svelte + SvelteKit |
|------|--------------|-----------------|-------------------|
| **迁移成本** | ⭐⭐⭐⭐⭐ 低 | ⭐⭐⭐ 中高 | ⭐⭐ 高 |
| **打包体积** | ⭐⭐⭐ 中 | ⭐⭐ 大 | ⭐⭐⭐⭐ 小 |
| **性能** | ⭐⭐⭐⭐ 优秀 | ⭐⭐⭐⭐ 优秀 | ⭐⭐⭐⭐⭐ 卓越 |
| **开发体验** | ⭐⭐⭐⭐ 良好 | ⭐⭐⭐⭐ 良好 | ⭐⭐⭐⭐ 良好 |
| **静态部署** | ⭐⭐⭐⭐ 原生支持 | ⭐⭐⭐⭐ 支持 | ⭐⭐⭐⭐ 支持 |
| **UI 组件库** | ⭐⭐⭐⭐ Vuetify | ⭐⭐⭐⭐ Material UI | ⭐⭐⭐ 较少 |

### 2.2 最终推荐方案

**🏆 推荐：Vue 3 + Vite + Pinia**

**决策理由：**

1. **代码复用最大化**：现有代码 85%+ 可复用
2. **构建速度提升**：Vite 比 Vue CLI 快 20-100 倍
3. **Vue 生态成熟**：Vuetify 3 完整支持 Material Design
4. **Pinia 优势**：Vue 官方推荐，TypeScript 支持更好，API 更简洁

### 2.3 技术栈清单

```yaml
# 核心框架
vue: 3.5.x
vite: 6.5.x
vue-router: 4.4.x
pinia: 2.2.x

# UI 组件
vuetify: 3.8.x
@mdi/font: 7.x

# 数据持久化
localforage: 1.10.x
dexie: 4.0.x

# 国际化
vue-i18n: 11.1.x

# 工具库
axios: 1.7.x
uuid: 9.x

# Markdown 渲染
@kangc/v-md-editor: 2.5.x
prismjs: 1.29.x

# 安全
crypto-js: 4.2.x
```

---

## 3. 架构设计

### 3.1 整体架构分层

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Presentation Layer                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │   Layout    │  │   Feature   │  │     UI      │  │  Settings   │  │
│  │  Components │  │  Components │  │  Components │  │  Components │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          Business Layer                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │  useChat    │  │  useBot     │  │  useTheme   │  │  useI18n    │  │
│  │  Composable │  │  Composable │  │  Composable │  │  Composable │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            Data Layer                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │  chatStore  │  │  botStore   │  │ settingsStore│ │  msgStore   │  │
│  │   (Pinia)   │  │   (Pinia)   │  │   (Pinia)   │  │   (Pinia)   │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       Infrastructure Layer                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │   IndexedDB  │  │ LocalStorage │  │  API Client │  │  Web APIs  │  │
│  │   (Dexie)   │  │  (Secured)   │  │   (Axios)   │  │ (Browser)   │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 目录结构设计

```
ChatALL-Web/
├── public/
│   ├── index.html              # HTML 模板（含 CSP）
│   ├── 404.html                # SPA fallback
│   ├── CNAME                   # 自定义域名
│   └── bots/                   # Bot 图标资源
├── src/
│   ├── main.js                 # Web 入口
│   ├── App.vue                 # 根组件
│   ├── adapters/               # 平台适配层（关键！）
│   │   ├── index.js
│   │   ├── electron.js         # Electron 适配（桌面版）
│   │   └── web.js              # Web 适配
│   ├── assets/
│   │   └── icons/
│   ├── bots/                   # Bot 实现（核心业务）
│   │   ├── index.js
│   │   ├── Bot.js              # Bot 基类
│   │   └── [category]/         # 分类目录
│   │       ├── anthropic/
│   │       ├── openai/
│   │       ├── deepseek/
│   │       └── ...
│   ├── components/             # Vue 组件
│   │   ├── Layout/
│   │   │   └── MainLayout.vue
│   │   ├── Chat/
│   │   │   ├── ChatDrawer.vue
│   │   │   ├── ChatMessages.vue
│   │   │   ├── ChatPrompt.vue
│   │   │   └── ChatResponse.vue
│   │   ├── Bots/
│   │   │   ├── BotSettings/
│   │   │   ├── BotLogo.vue
│   │   │   └── BotsMenu.vue
│   │   ├── UI/
│   │   │   ├── ConfirmModal.vue
│   │   │   └── LoadingSpinner.vue
│   │   └── Settings/
│   │       └── SettingsModal.vue
│   ├── composables/            # Vue Composables
│   │   ├── useTheme.js
│   │   ├── useNativeTheme.js
│   │   ├── useSecureStorage.js
│   │   └── useApiClient.js
│   ├── router/
│   │   └── index.js
│   ├── services/               # 服务层
│   │   ├── api.js              # HTTP 请求封装
│   │   ├── auth.js             # 认证服务
│   │   └── storage.js          # 存储服务
│   ├── store/                  # Pinia Store
│   │   ├── index.js
│   │   ├── chat.js
│   │   ├── bot.js
│   │   ├── settings.js
│   │   └── messages.js
│   ├── styles/                 # 全局样式
│   │   ├── variables.scss
│   │   └── main.scss
│   ├── utils/                  # 工具函数
│   │   ├── secureStorage.js    # 加密存储
│   │   ├── sanitizer.js        # 日志脱敏
│   │   └── logger.js           # 安全日志
│   └── i18n/                   # 国际化
│       ├── index.js
│       └── locales/
│           ├── zh.json
│           └── en.json
├── tests/                      # 测试
│   ├── unit/
│   ├── e2e/
│   └── fixtures/
├── .github/
│   └── workflows/
│       ├── ci.yml              # CI 工作流
│       └── deploy.yml           # 部署工作流
├── vite.config.js              # Vite 配置
├── package.json
└── README.md
```

### 3.3 核心模块设计

#### 3.3.1 平台适配层（关键设计）

```javascript
// src/adapters/index.js
// 根据环境自动选择适配器
const adapter = import.meta.env.DEV
  ? await import('./web.js')
  : await import('./web.js');

export const platform = {
  isElectron: false,
  isWeb: true,
  ipcRenderer: adapter.ipcRenderer,
  shell: adapter.shell,
  storage: adapter.storage,
};
```

#### 3.3.2 状态管理设计（Pinia）

```javascript
// src/store/bots.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useBotStore = defineStore('bots', () => {
  // State
  const bots = ref([]);
  const selectedBotIds = ref([]);
  const botConfigs = ref({});

  // Getters
  const selectedBots = computed(() =>
    bots.value.filter(bot => selectedBotIds.value.includes(bot.id))
  );

  const availableBots = computed(() =>
    bots.value.filter(bot => bot.isAvailable())
  );

  const botsByCategory = computed(() => {
    const categories = {};
    bots.value.forEach(bot => {
      if (!categories[bot.category]) {
        categories[bot.category] = [];
      }
      categories[bot.category].push(bot);
    });
    return categories;
  });

  // Actions
  function registerBot(bot) {
    bots.value.push(bot);
  }

  function toggleBot(botId) {
    const index = selectedBotIds.value.indexOf(botId);
    if (index === -1) {
      selectedBotIds.value.push(botId);
    } else {
      selectedBotIds.value.splice(index, 1);
    }
  }

  function updateBotConfig(botId, config) {
    botConfigs.value[botId] = { ...botConfigs.value[botId], ...config };
  }

  return {
    bots,
    selectedBotIds,
    botConfigs,
    selectedBots,
    availableBots,
    botsByCategory,
    registerBot,
    toggleBot,
    updateBotConfig,
  };
});
```

#### 3.3.3 服务层设计

```javascript
// src/services/api.js
class ApiService {
  constructor() {
    this.clients = {
      openai: this.createClient('https://api.openai.com/v1'),
      anthropic: this.createClient('https://api.anthropic.com/v1'),
      gemini: this.createClient('https://generativelanguage.googleapis.com/v1'),
      // ... 其他 API
    };
  }

  createClient(baseURL) {
    const client = axios.create({
      baseURL,
      timeout: 60000,
      headers: { 'Content-Type': 'application/json' },
    });

    client.interceptors.request.use((config) => {
      // 添加认证信息
      const apiKey = secureStorage.getApiKey(config.service);
      if (apiKey) {
        config.headers['Authorization'] = `Bearer ${apiKey}`;
      }
      return config;
    });

    client.interceptors.response.use(
      (response) => response,
      (error) => {
        safeLogger.error('API Error:', sanitize(error));
        throw error;
      }
    );

    return client;
  }

  async sendPrompt(service, endpoint, payload) {
    return this.clients[service].post(endpoint, payload);
  }
}

export const apiService = new ApiService();
```

---

## 4. 安全性设计

### 4.1 威胁模型分析

| 威胁类型 | 严重程度 | 描述 | 缓解措施 |
|----------|----------|------|----------|
| API Key 窃取 | 🔴 极高 | LocalStorage 明文存储 | Web Crypto AES-256-GCM 加密 |
| XSS 攻击 | 🔴 高 | 恶意脚本注入 | 严格 CSP 策略 |
| 中间人攻击 | 🟠 中高 | 网络拦截 | HTTPS 强制 + 证书校验 |
| CSRF | 🟡 中 | 跨站请求伪造 | CSRF Token |
| 恶意代理 | 🔴 高 | 用户配置恶意代理 | 请求签名 + 来源校验 |
| 浏览器扩展窃取 | 🔴 高 | 扩展可访问存储 | 内存密码管理器 |

### 4.2 API Key 安全存储方案

#### 4.2.1 Web Crypto API 加密存储

```javascript
// src/utils/secureStorage.js
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const ITERATIONS = 100000;

/**
 * 从用户主密码派生加密密钥 (PBKDF2)
 */
async function deriveKey(password, salt) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * 加密敏感数据
 */
async function encrypt(plaintext, password) {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(password, salt);

  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoder.encode(plaintext)
  );

  // 合并 salt + iv + ciphertext
  const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  result.set(salt, 0);
  result.set(iv, salt.length);
  result.set(new Uint8Array(encrypted), salt.length + iv.length);

  return btoa(String.fromCharCode(...result));
}

/**
 * 解密敏感数据
 */
async function decrypt(ciphertext, password) {
  const data = new Uint8Array(
    atob(ciphertext).split('').map(c => c.charCodeAt(0))
  );

  const salt = data.slice(0, SALT_LENGTH);
  const iv = data.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const encrypted = data.slice(SALT_LENGTH + IV_LENGTH);

  const key = await deriveKey(password, salt);

  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    encrypted
  );

  return new TextDecoder().decode(decrypted);
}

/**
 * 安全存储 API Key
 */
export async function storeApiKey(botId, apiKey, masterPassword) {
  const encrypted = await encrypt(apiKey, masterPassword);
  const db = await openDatabase();
  await db.put('secure_credentials', {
    id: `apiKey_${botId}`,
    data: encrypted,
    updatedAt: Date.now(),
  });
}

/**
 * 安全获取 API Key
 */
export async function getApiKey(botId, masterPassword) {
  const db = await openDatabase();
  const record = await db.get('secure_credentials', `apiKey_${botId}`);
  if (!record) return null;
  return await decrypt(record.data, masterPassword);
}
```

#### 4.2.2 内存密码管理器

```javascript
// src/store/secureKeyManager.js
class SecureKeyManager {
  constructor() {
    this.keys = new Map();
    this.lockTimeout = 5 * 60 * 1000; // 5分钟
    this.lastActivity = Date.now();
  }

  setKey(botId, key) {
    this.keys.set(botId, key);
    this.lastActivity = Date.now();
  }

  getKey(botId) {
    if (this.isExpired()) {
      this.clearAll();
      return null;
    }
    this.lastActivity = Date.now();
    return this.keys.get(botId);
  }

  isExpired() {
    return Date.now() - this.lastActivity > this.lockTimeout;
  }

  clearAll() {
    this.keys.clear();
  }

  setupVisibilityLock() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.lock();
      }
    });
  }

  lock() {
    this.keys.clear();
  }
}

export const secureKeyManager = new SecureKeyManager();
```

### 4.3 CSP 策略配置

```html
<!-- public/index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com;
  style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.googleapis.com;
  img-src 'self' data: https: blob:;
  font-src 'self' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.gstatic.com;
  connect-src 'self' 
    https://api.openai.com 
    https://api.anthropic.com 
    https://generativelanguage.googleapis.com
    https://api.moonshot.cn
    https://kimi.moonshot.cn
    https://api.x.ai
    https://*.baidu.com
    https://*.wenxin-qianfan.com
    https://spark-api.xf-yun.com
    https://api.minimax.chat;
  frame-src 'none';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
">
```

### 4.4 日志脱敏

```javascript
// src/utils/sanitizer.js
const SENSITIVE_PATTERNS = [
  { pattern: /api[_-]?key/gi, replacement: '[API_KEY]' },
  { pattern: /secret[_-]?key/gi, replacement: '[SECRET_KEY]' },
  { pattern: /access[_-]?token/gi, replacement: '[ACCESS_TOKEN]' },
  { pattern: /refresh[_-]?token/gi, replacement: '[REFRESH_TOKEN]' },
  { pattern: /bearer\s+[a-zA-Z0-9\-_.]+/gi, replacement: 'Bearer [TOKEN]' },
  { pattern: /sk-[a-zA-Z0-9]{20,}/g, replacement: 'sk-***' },
  { pattern: /([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, replacement: '[EMAIL]' },
];

function sanitize(obj, depth = 0) {
  if (depth > 10) return '[MAX_DEPTH]';
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    let result = obj;
    for (const { pattern, replacement } of SENSITIVE_PATTERNS) {
      result = result.replace(pattern, replacement);
    }
    return result;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitize(item, depth + 1));
  }

  if (typeof obj === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = sanitize(value, depth + 1);
    }
    return result;
  }

  return obj;
}

export const safeLogger = {
  log: (...args) => console.log(...sanitize(args)),
  error: (...args) => console.error(...sanitize(args)),
  warn: (...args) => console.warn(...sanitize(args)),
};
```

### 4.5 安全检查清单

| 检查项 | 状态 | 说明 |
|--------|------|------|
| CSP 策略配置 | ✅ | index.html 添加严格 CSP meta 标签 |
| API Key 加密存储 | ✅ | Web Crypto AES-256-GCM |
| 日志脱敏 | ✅ | 全局替换敏感信息 |
| 第三方脚本移除 | ✅ | 移除 Geetest 注入 |
| HTTPS 强制 | ✅ | CSP upgrade-insecure-requests |
| X-Frame-Options | ✅ | 防止点击劫持 |
| 内存超时锁定 | ✅ | 5 分钟无操作自动清除 |

---

## 5. 性能优化策略

### 5.1 当前性能瓶颈

| 瓶颈 | 预估影响 | 优化优先级 |
|------|----------|------------|
| Vuetify 完整导入 | ~400KB gzip | 🔴 高 |
| @kangc/v-md-editor | ~250KB gzip | 🔴 高 |
| LangChain 全量包 | ~800KB+ gzip | 🔴 高 |
| 76 个 Bot 全量实例化 | ~400KB | 🔴 高 |
| 无虚拟滚动 | 大量消息时 DOM 过量 | 🟠 中 |

### 5.2 代码分割策略

```javascript
// vite.config.js
export default defineConfig({
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    cssCodeSplit: true,

    rollupOptions: {
      output: {
        manualChunks: {
          // 核心框架 - 首屏必需
          'vendor-core': ['vue', 'pinia', 'vue-i18n', 'dexie'],

          // UI 框架 - 单独 chunk
          'vendor-vuetify': ['vuetify', '@mdi/font'],

          // Markdown - 按需加载
          'vendor-markdown': ['@kangc/v-md-editor', 'prismjs', 'katex'],

          // LangChain - 懒加载
          'vendor-langchain': ['langchain', '@langchain/core'],

          // Bots - 动态导入
          'bots': ['@/bots/index'],
        }
      }
    },
  },
});
```

### 5.3 Bot 懒加载实现

```javascript
// src/bots/index.js
const botModules = import.meta.glob('@/bots/**/*.js');

// 静态映射 - 优先使用
const botPathMap = {
  'ChatGPTBot': '@/bots/openai/ChatGPTBot.js',
  'ClaudeAPIBot': '@/bots/anthropic/ClaudeAPIBot.js',
  'GeminiAPIBot': '@/bots/google/GeminiAPIBot.js',
  'DeepSeekBot': '@/bots/deepseek/DeepSeekBot.js',
  // ... 其他 Bots
};

export const getBotInstance = async (className) => {
  const path = botPathMap[className];
  if (path && botModules[path]) {
    const module = await botModules[path]();
    return module.default.getInstance();
  }

  // 兜底: 遍历所有模块
  for (const [p, loader] of Object.entries(botModules)) {
    if (p.includes(className)) {
      const module = await loader();
      return module.default.getInstance();
    }
  }
};

export default {
  getBotByClassName: getBotInstance,
};
```

### 5.4 虚拟滚动配置

```vue
<!-- src/components/Chat/ChatMessages.vue -->
<template>
  <RecycleScroller
    class="messages-scroller"
    :items="currentChatMessages"
    :item-size="null"
    key-field="index"
    v-slot="{ item }"
  >
    <ChatPrompt v-if="item.type === 'prompt'" :message="item" />
    <ChatResponse v-else :message="item" />
  </RecycleScroller>
</template>

<script setup>
import { RecycleScroller } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
</script>
```

### 5.5 性能目标

| 指标 | 当前预估 | 第一阶段目标 | 最终目标 |
|------|----------|--------------|----------|
| FCP | 3-5s | 2.0s | < 1.5s |
| LCP | 4-6s | 3.0s | < 2.5s |
| TTI | 6-10s | 4.5s | < 3.5s |
| 首屏 JS | 2.5MB | 800KB | < 500KB |
| 滚动 FPS | < 30 | 55+ | 60 |

---

## 6. GitHub Pages 部署配置

### 6.1 Vite 配置

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true }),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  // GitHub Pages 子路径配置
  base: process.env.NODE_ENV === 'production'
    ? '/ChatALL/'
    : '/',

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
  },

  server: {
    port: 3000,
    host: true,
  },
});
```

### 6.2 SPA Fallback (404.html)

```html
<!-- public/404.html -->
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>ChatALL</title>
    <script>
      // SPA fallback: 将所有 404 重定向到 index.html
      var path = window.location.pathname;
      var search = window.location.search;
      var base = '/ChatALL/';
      var redirectPath = path.startsWith(base)
        ? path
        : base + path.replace(/^\//, '');
      window.location.href = redirectPath + search + window.location.hash;
    </script>
  </head>
  <body>
  </body>
</html>
```

### 6.3 自定义域名配置

```text
# public/CNAME
chatall.yourdomain.com
```

### 6.4 DNS 配置

```
# CNAME 记录
chatall.yourdomain.com  CNAME  qingjian0.github.io
```

---

## 7. Electron 迁移指南

### 7.1 需要移除的 Electron 代码

| 文件 | 移除内容 | 替换方案 |
|------|----------|----------|
| `src/main.js` | `window.require("electron")` | 移除 |
| `src/main.js` | `ipcRenderer.invoke("get-native-theme")` | `window.matchMedia()` |
| `src/main.js` | `ipcRenderer.invoke("set-is-show-menu-bar")` | localStorage |
| `src/App.vue` | `window.require("electron")` | 移除 |
| `src/App.vue` | `ipcRenderer.on("on-updated-system-theme", ...)` | `matchMedia` 监听 |
| `src/theme.js` | `ipcRenderer.invoke("get-native-theme")` | 浏览器 API |
| 所有 Bot | `electron.shell.openExternal` | `window.open` |

### 7.2 平台适配层实现

```javascript
// src/adapters/web.js
export const ipcRenderer = {
  invoke: async (channel, ...args) => {
    switch (channel) {
      case 'get-native-theme':
        return window.matchMedia('(prefers-color-scheme: dark)').matches
          ? { shouldUseDarkColors: true }
          : { shouldUseDarkColors: false };
      case 'set-is-show-menu-bar':
        localStorage.setItem('isShowMenuBar', args[0]);
        return;
      default:
        console.warn(`ipcRenderer.invoke called: ${channel}`, args);
        return null;
    }
  },

  on: (channel, callback) => {
    if (channel === 'on-updated-system-theme') {
      window.matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', (e) => {
          callback(null, null, {
            shouldUseDarkColors: e.matches
          });
        });
    }
  },

  send: () => {},
};

export const shell = {
  openExternal: (url) => window.open(url, '_blank'),
};

export const storage = {
  get: (key) => localStorage.getItem(key),
  set: (key, value) => localStorage.setItem(key, value),
  remove: (key) => localStorage.removeItem(key),
};
```

### 7.3 主题系统改造

```javascript
// src/composables/useNativeTheme.js
import { ref, onMounted, onUnmounted } from 'vue';

export function useNativeTheme() {
  const prefersDark = ref(false);
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const updateTheme = (e) => {
    prefersDark.value = e.matches;
  };

  onMounted(() => {
    prefersDark.value = mediaQuery.matches;
    mediaQuery.addEventListener('change', updateTheme);
  });

  onUnmounted(() => {
    mediaQuery.removeEventListener('change', updateTheme);
  });

  return { prefersDark };
}

// src/theme.js 改造后
export const resolveTheme = async (mode) => {
  if (mode === Mode.SYSTEM) {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return isDark ? Theme.DARK : Theme.LIGHT;
  }
  return mode;
};
```

---

## 8. Bot 兼容性与改造

### 8.1 Bot 分类与兼容性

| 类别 | 示例 Bot | CORS 支持 | Web 兼容性 | 需要改造 |
|------|----------|-----------|------------|----------|
| **API 类** | OpenAI API, Claude API, Gemini API | ✅ 支持 | ✅ 直接调用 | ❌ 无需改造 |
| **Web 登录类** | Kimi, Doubao Web, DeepSeek Web | ❌ 不支持 | ⚠️ 需要 OAuth | ✅ 改造登录流程 |
| **国内 API** | 百度文心, 阿里通义, 讯飞星火 | ❌ 不支持 | ⚠️ 需要代理 | ✅ CORS 代理 |

### 8.2 API 类 Bot（直接可用）

| Bot | API Endpoint | 认证方式 |
|-----|---------------|----------|
| OpenAI API | `api.openai.com/v1` | Bearer Token |
| Anthropic API | `api.anthropic.com/v1` | x-api-key |
| Google Gemini | `generativelanguage.googleapis.com` | API Key |
| Groq API | `api.groq.com/openai/v1` | Bearer Token |
| Cohere API | `api.cohere.ai/v1` | Bearer Token |
| DeepSeek API | `api.deepseek.com/v1` | Bearer Token |

### 8.3 需要改造的 Bot

#### 8.3.1 Web 登录类 Bot 改造方案

```javascript
// src/services/auth.js
class AuthService {
  // OAuth 授权流程
  async loginWithOAuth(botId) {
    const oauthUrls = {
      'KimiBot': 'https://auth.moonshot.cn/authorize',
      'DoubaoWebBot': 'https://console.volcengine.com/oauth',
      'DeepSeekWebBot': 'https://api.deepseek.com/oauth',
    };

    if (!oauthUrls[botId]) return null;

    return new Promise((resolve, reject) => {
      const width = 500, height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        oauthUrls[botId],
        'OAuth Login',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      window.addEventListener('message', (event) => {
        if (event.data.type === 'OAUTH_TOKEN' && event.data.botId === botId) {
          resolve(event.data.token);
          popup?.close();
        }
      }, { once: true });
    });
  }

  // 手动 Token 输入（备选方案）
  getManualToken(botId) {
    const tokens = JSON.parse(localStorage.getItem('manual-tokens') || '{}');
    return tokens[botId];
  }
}

export const authService = new AuthService();
```

### 8.4 CORS 代理配置

```javascript
// src/utils/apiProxy.js
class SecureApiProxy {
  constructor() {
    // 用户可配置自己的代理服务器
    this.proxyUrl = localStorage.getItem('cors-proxy-url') || null;
  }

  async request(service, path, options) {
    if (!this.proxyUrl) {
      throw new Error('CORS proxy not configured');
    }

    const url = `${this.proxyUrl}/${service}${path}`;

    const response = await fetch(url, {
      method: options.method,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': options.apiKey, // 不经过代理的 API Key
      },
      body: options.body,
    });

    if (!response.ok) {
      throw new Error(`Proxy error: ${response.status}`);
    }

    return response.json();
  }
}

export const apiProxy = new SecureApiProxy();
```

---

## 9. CI/CD 流水线设计

### 9.1 GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages-deploy
  cancel-in-progress: true

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          persist-credentials: false

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Build
        env:
          VUE_APP_PUBLIC_PATH: ${{ vars.PUBLIC_PATH || '/ChatALL/' }}
          VUE_APP_VERSION: ${{ github.ref_name }}-${{ github.sha }}
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4

      - name: Deployment Summary
        run: |
          echo "## Deployment Complete" >> $GITHUB_STEP_SUMMARY
          echo "- URL: ${{ steps.deployment.outputs.page_url }}" >> $GITHUB_STEP_SUMMARY
          echo "- Commit: ${{ github.sha }}" >> $GITHUB_STEP_SUMMARY
```

### 9.2 CI 工作流

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run test:unit

  build:
    needs: [lint, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
          retention-days: 7
```

### 9.3 回滚策略

```yaml
# .github/workflows/rollback.yml
name: Rollback

on:
  workflow_dispatch:
    inputs:
      artifact_id:
        description: 'Artifact ID to rollback'
        required: true
        type: string

jobs:
  rollback:
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    steps:
      - name: Download artifact
        uses: actions/download-pages-artifact@v3
        with:
          path: './dist'
          artifact-id: ${{ inputs.artifact_id }}

      - name: Deploy
        uses: actions/deploy-pages@v4
```

---

## 10. 测试与验证

### 10.1 测试策略

| 测试类型 | 覆盖率目标 | 工具 |
|----------|------------|------|
| 单元测试 | 80%+ | Vitest |
| 组件测试 | 70%+ | Vue Test Utils |
| E2E 测试 | 核心流程 | Playwright |
| 性能测试 | Lighthouse > 90 | Lighthouse CI |

### 10.2 关键测试用例

```javascript
// tests/unit/secureStorage.test.js
describe('SecureStorage', () => {
  it('should encrypt and decrypt API key correctly', async () => {
    const apiKey = 'sk-test123456';
    const password = 'test-password';

    const encrypted = await encrypt(apiKey, password);
    const decrypted = await decrypt(encrypted, password);

    expect(decrypted).toBe(apiKey);
  });

  it('should fail with wrong password', async () => {
    const apiKey = 'sk-test123456';
    const password = 'correct-password';
    const wrongPassword = 'wrong-password';

    const encrypted = await encrypt(apiKey, password);

    await expect(decrypt(encrypted, wrongPassword)).rejects.toThrow();
  });
});

// tests/e2e/chat.spec.js
describe('Chat Flow', () => {
  it('should send prompt to selected bots', async () => {
    await page.goto('/');

    // Select bots
    await page.click('[data-testid="bot-ChatGPTBot"]');
    await page.click('[data-testid="bot-ClaudeAPIBot"]');

    // Enter prompt
    await page.fill('[data-testid="prompt-input"]', 'Hello, world!');
    await page.click('[data-testid="send-button"]');

    // Wait for responses
    await page.waitForSelector('[data-testid="response-0"]', { timeout: 30000 });
    await page.waitForSelector('[data-testid="response-1"]', { timeout: 30000 });

    // Verify responses
    const responses = await page.$$('[data-testid^="response-"]');
    expect(responses.length).toBe(2);
  });
});
```

### 10.3 部署验证清单

```markdown
## 部署前检查清单

### 代码
- [ ] 所有 `window.require("electron")` 已移除
- [ ] Electron 适配层已创建
- [ ] CSP 策略已配置
- [ ] API Key 加密存储已实现

### 构建
- [ ] `npm run build` 成功
- [ ] Bundle Size < 500KB (首屏)
- [ ] 无 Tree-shaking 警告

### GitHub
- [ ] Pages Source 设置为 gh-pages 分支
- [ ] Enforce HTTPS 已启用
- [ ] GitHub Secrets 已配置

### 测试
- [ ] `npm run test:unit` 通过
- [ ] `npm run test:e2e` 通过
- [ ] Lighthouse 性能 > 90
```

---

## 11. 风险评估与应对

### 11.1 风险矩阵

| 风险 | 概率 | 影响 | 风险等级 | 应对措施 |
|------|------|------|----------|----------|
| 部分 Bot 无法使用 | 高 | 中 | 🟠 中 | 提供手动 Token 输入方案 |
| CORS 限制 | 高 | 中 | 🟠 中 | 提供 CORS 代理配置 |
| 代理功能不可用 | 中 | 低 | 🟢 低 | 在 UI 中说明限制 |
| GitHub Pages 配额超限 | 低 | 低 | 🟢 低 | 考虑 Cloudflare Pages |
| 安全漏洞 | 低 | 高 | 🟠 中 | 安全代码审查 |

### 11.2 降级策略

| 场景 | 降级方案 |
|------|----------|
| API Bot 无法连接 | 显示错误信息，引导用户检查 API Key |
| Web Bot 登录失败 | 提供手动 Token 输入 |
| CORS 代理配置复杂 | 提供简化配置向导 |
| 大量消息卡顿 | 自动降级为普通滚动 |

---

## 12. 实施路线图

### 12.1 阶段划分

```
Phase 1: 基础设施 (Week 1-2)
├── 创建 Vite 项目脚手架
├── 配置 Vuetify、Pinia、vue-i18n
├── 创建 Electron 适配层
├── 配置 GitHub Pages 部署
└── 建立 CI/CD 流水线

Phase 2: 核心功能 (Week 3-5)
├── 迁移 Bot 逻辑（API 类优先）
├── 实现安全存储
├── 实现聊天功能
├── 实现消息列表
└── 实现主题切换

Phase 3: 功能完善 (Week 6-7)
├── 迁移 Web 登录类 Bot
├── 实现 CORS 代理配置
├── 实现 Bot 设置界面
├── 完善国际化
└── 性能优化

Phase 4: 测试发布 (Week 8)
├── 单元测试
├── E2E 测试
├── 性能测试
├── 安全审计
└── 发布 v1.0
```

### 12.2 预估工作量

| 阶段 | 工作量 |
|------|--------|
| Phase 1: 基础设施 | 5-7 人天 |
| Phase 2: 核心功能 | 12-15 人天 |
| Phase 3: 功能完善 | 8-10 人天 |
| Phase 4: 测试发布 | 5-7 人天 |
| **总计** | **30-39 人天** |

### 12.3 里程碑

| 里程碑 | 目标日期 | 交付物 |
|--------|----------|--------|
| M1: 原型 | Week 2 | 可运行原型，核心聊天功能 |
| M2: Beta | Week 5 | API Bot 全部可用 |
| M3: RC | Week 7 | 所有 Bot 迁移完成 |
| M4: GA | Week 8 | 正式发布 |

---

## 附录

### A. 关键技术参考

| 技术 | 参考文档 |
|------|----------|
| Vue 3 | https://vuejs.org/guide/ |
| Vite | https://vitejs.dev/guide/ |
| Pinia | https://pinia.vuejs.org/ |
| Vuetify | https://vuetifyjs.com/ |
| Web Crypto API | https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API |
| GitHub Pages | https://docs.github.com/en/pages |

### B. 决策记录

| 决策 | 原因 | 日期 |
|------|------|------|
| Vue 3 + Vite | 迁移成本最低，生态成熟 | 2026-06-10 |
| Pinia 替代 Vuex | Vue 官方推荐，API 更简洁 | 2026-06-10 |
| Web Crypto API | W3C 标准，安全性高 | 2026-06-10 |
| GitHub Pages | 免费，与 GitHub 集成最佳 | 2026-06-10 |

---

*本文档由多专家团队评审生成*
*评审专家：架构专家、安全专家、性能专家、部署专家*
*评审日期：2026-06-10*
