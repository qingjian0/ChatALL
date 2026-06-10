# ChatALL Web 状态管理与路由设计

## 一、Pinia Store 设计

### 1.1 chatStore

**状态定义：**
- `chats` - 聊天列表数组
- `currentChatIndex` - 当前聊天索引
- `isChatDrawerOpen` - 侧边栏展开状态
- `activeBotClassnames` - 激活的 Bot 类名列表
- `isLoading` - 加载状态

**计算属性：**
- `currentChat` - 当前聊天对象
- `activeBots` - 当前激活的 Bots
- `sortedChats` - 按时间排序的聊天列表

**核心方法：**
- `loadChats()` - 加载聊天列表
- `addNewChat()` - 创建新聊天
- `selectChat(index)` - 选择聊天
- `selectChatById(id)` - 通过 ID 选择聊天（支持路由）
- `deleteChat(id)` - 删除聊天
- `setBotSelected(botClassname, selected)` - 设置 Bot 选中状态
- `duplicateChat(id)` - 复制聊天

### 1.2 botStore

**状态定义：**
- `bots` - Bot 列表
- `activeBots` - 激活的 Bots
- `botConfigs` - Bot 配置
- `botStatus` - Bot 状态映射
- `botInstances` - Bot 实例缓存
- `isInitialized` - 初始化状态

**计算属性：**
- `availableBots` - 可用 Bots
- `onlineBots` - 在线 Bots
- `offlineBots` - 离线 Bots
- `loadingBots` - 加载中 Bots

**核心方法：**
- `initBots()` - 初始化 Bots
- `loadBotConfigs()` - 加载 Bot 配置
- `createBotInstance(classname)` - 创建 Bot 实例
- `checkBotOnlineStatus(classname)` - 检查 Bot 在线状态
- `testBotConnection(classname)` - 测试 Bot 连接

### 1.3 settingsStore

**状态定义：**
- `settings` - 设置对象，包含：
  - `lang` - 语言
  - `theme` - 主题
  - `columns` - 列数
  - `chat` - 聊天设置
  - `general` - 通用设置
  - `privacy` - 隐私设置
  - `security` - 安全设置
  - `advanced` - 高级设置
  - `account` - 账户设置

**计算属性：**
- `isDarkMode` - 是否深色模式
- `hasPassword` - 是否设置主密码

**核心方法：**
- `loadSettings()` - 加载设置
- `saveSettings()` - 保存设置
- `setMasterPassword(password)` - 设置主密码
- `verifyMasterPassword(password)` - 验证密码
- `resetToDefaults()` - 重置为默认值

### 1.4 messageStore

**状态定义：**
- `messages` - 消息列表
- `threads` - 线程列表
- `messageStatus` - 消息状态映射
- `isTyping` - 正在输入的 Bots
- `chatId` - 当前聊天 ID

**计算属性：**
- `prompts` - 提示消息
- `responses` - 响应消息
- `groupedMessages` - 分组消息
- `unreadCount` - 未读数量
- `pendingResponses` - 待处理响应

**核心方法：**
- `loadMessages(chatId)` - 加载消息
- `addMessage(chatId, content)` - 添加消息
- `updateMessage(id, updates)` - 更新消息
- `markMessageAsRead(id)` - 标记已读
- `searchMessages(chatId, query)` - 搜索消息
- `exportMessages(chatId)` - 导出消息

### 1.5 secureStore

**状态定义：**
- `masterKey` - 主密钥
- `securityLevel` - 安全级别
- `sessionToken` - 会话令牌
- `isLocked` - 锁定状态
- `lastActivityTime` - 最后活动时间

**计算属性：**
- `isInitialized` - 是否初始化
- `isAuthenticated` - 是否认证

**核心方法：**
- `init(password)` - 初始化安全存储
- `lock()` - 锁定
- `unlock(password)` - 解锁
- `encrypt(data)` - 加密数据
- `decrypt(data)` - 解密数据
- `generateKeyPair()` - 生成密钥对

---

## 二、路由设计

### 2.1 路由配置

```javascript
{
  path: '/',                  name: 'Home',           // 首页（聊天列表）
  path: '/chat/:id',          name: 'ChatDetail',     // 聊天详情
  path: '/settings',          name: 'Settings',       // 设置首页
  path: '/settings/bots',     name: 'SettingsBots',   // Bot 设置
  path: '/settings/account',  name: 'SettingsAccount',// 账户设置
  path: '/settings/security', name: 'SettingsSecurity',// 安全设置
  path: '/settings/privacy',  name: 'SettingsPrivacy',// 隐私设置
  path: '/settings/advanced', name: 'SettingsAdvanced',// 高级设置
  path: '/about',             name: 'About',          // 关于页面
  path: '/help',              name: 'Help',           // 帮助页面
  path: '/lock',              name: 'Lock',           // 锁屏页面
  path: '/:pathMatch(.*)*',   name: 'NotFound',       // 404 页面
}
```

### 2.2 GitHub Pages 子路径支持

```javascript
const BASE_PATH = process.env.NODE_ENV === 'production' ? '/ChatALL/' : '/'
const router = createRouter({
  history: createWebHistory(BASE_PATH),
  ...
})
```

### 2.3 路由守卫

```javascript
router.beforeEach((to, from, next) => {
  if (to.name === 'Lock') {
    next()
    return
  }
  if (settingsStore.settings.security.requirePasswordOnStartup && !secureStore.isAuthenticated) {
    next({ name: 'Lock' })
    return
  }
  next()
})
```

---

## 三、状态持久化策略

### 3.1 多级存储架构

| 存储层级 | 技术 | 用途 | 容量限制 |
|---------|------|------|---------|
| **内存缓存** | Map | 快速访问活跃数据 | 有限（浏览器内存） |
| **SessionStorage** | Web API | 临时会话数据 | 5MB |
| **LocalStorage** | Web API | 设置数据（加密） | 5MB |
| **IndexedDB** | Dexie | 聊天记录、消息 | 无限制 |

### 3.2 缓存策略

**TTL 缓存：**
- 内存缓存 TTL：5 分钟
- 自动清理过期缓存

**缓存优先级：**
1. 内存缓存（最快）
2. SessionStorage（会话内）
3. LocalStorage（持久）
4. IndexedDB（大数据）

### 3.3 数据备份与恢复

```javascript
// 备份
const backup = await storage.backupData()

// 恢复
await storage.restoreData(backup)
```

---

## 四、数据流转图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           用户界面 (UI)                                    │
└───────────────────────┬─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Pinia Stores                                     │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌────────────┐  ┌───────────┐ │
│  │chatStore │  │botStore  │  │settings   │  │messageStore│  │secureStore│ │
│  │          │  │          │  │  Store    │  │            │  │           │ │
│  └────┬─────┘  └────┬─────┘  └─────┬─────┘  └──────┬─────┘  └─────┬─────┘ │
│       │             │             │                │              │       │
└───────┼─────────────┼─────────────┼────────────────┼──────────────┼───────┘
        │             │             │                │              │
        ▼             ▼             ▼                ▼              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           持久化层                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌───────────────────────────┐   │
│  │   LocalStorage  │  │  SessionStorage │  │       IndexedDB           │   │
│  │  (设置、配置)   │  │   (临时数据)    │  │  (聊天记录、消息)          │   │
│  │  - chatall-    │  │   - chatall-    │  │  - chats                  │   │
│  │    settings    │  │     session-*   │  │  - messages                │   │
│  │  - chatall-    │  │                 │  │  - threads                 │   │
│  │    bot-configs │  │                 │  │                           │   │
│  └─────────────────┘  └─────────────────┘  └───────────────────────────┘   │
│                          │                       │                        │
│                          └───────────┬───────────┘                        │
│                                      ▼                                    │
│                         ┌─────────────────────┐                            │
│                         │     Memory Cache    │                            │
│                         │  (TTL: 5 minutes)   │                            │
│                         └─────────────────────┘                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 五、安全设计

### 5.1 加密策略

- **AES-GCM 256位** - 数据加密
- **PBKDF2** - 密钥派生（100000 次迭代）
- **SHA-256** - 哈希算法

### 5.2 密钥管理

```javascript
// 生成主密钥
const masterKey = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
  passwordMaterial,
  { name: 'AES-GCM', length: 256 },
  true,
  ['encrypt', 'decrypt']
)
```

### 5.3 安全级别

| 级别 | 迭代次数 | 适用场景 |
|------|---------|---------|
| Low | 50000 | 开发/测试 |
| Medium | 100000 | 默认 |
| High | 150000 | 高安全需求 |
| Maximum | 200000 | 最高安全 |

---

## 六、文件结构

```
src/
├── stores/
│   ├── chatStore.js      # 聊天状态管理
│   ├── botStore.js       # Bot 状态管理
│   ├── settingsStore.js  # 设置状态管理
│   ├── messageStore.js   # 消息状态管理
│   └── secureStore.js    # 安全状态管理
├── router/
│   └── index.js          # 路由配置
├── utils/
│   ├── storage.js        # 多级存储工具
│   ├── database.js       # IndexedDB 封装
│   ├── cache.js          # 缓存工具
│   └── secureStorage.js  # 加密存储
├── views/
│   ├── HomeView.vue      # 首页
│   ├── SettingsView.vue  # 设置首页
│   ├── AboutView.vue     # 关于页面
│   ├── NotFound.vue      # 404 页面
│   ├── LockView.vue      # 锁屏页面
│   ├── WelcomeView.vue   # 欢迎页面
│   ├── LoginView.vue     # 登录页面
│   ├── HelpView.vue      # 帮助页面
│   └── settings/
│       ├── BotsSettings.vue
│       ├── AppearanceSettings.vue
│       ├── AccountSettings.vue
│       ├── SecuritySettings.vue
│       ├── PrivacySettings.vue
│       └── AdvancedSettings.vue
```

---

## 七、关键设计要点

1. **响应式状态** - 使用 Pinia + Vue 3 Composition API
2. **持久化分层** - 多级缓存策略确保性能和数据安全
3. **安全优先** - 敏感数据加密存储，支持主密码保护
4. **路由守卫** - 密码保护页面自动重定向
5. **懒加载** - 路由组件按需加载，优化首屏性能
6. **GitHub Pages 兼容** - 支持子路径部署
