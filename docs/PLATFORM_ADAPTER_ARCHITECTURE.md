# ChatALL Web Access 平台适配层架构文档

## 1. 架构概述

平台适配层是 ChatALL 应用的核心基础设施层，旨在实现**一套代码、多端运行**的目标。通过抽象平台差异，为应用层提供统一的 API 接口。

### 1.1 架构层次

```
┌─────────────────────────────────────────┐
│              应用层 (App)               │
│  ┌───────────────────────────────────┐  │
│  │  Vue Components / Stores / Utils  │  │
│  └───────────────────────────────────┘  │
├─────────────────────────────────────────┤
│          平台适配层 (Platform Adapter)   │
│  ┌───────────────────────────────────┐  │
│  │  统一API接口 / 动态适配 / 降级方案  │  │
│  └───────────────────────────────────┘  │
├─────────────────────────────────────────┤
│  Electron层 │    Web层    │   移动端层   │
│  (原生API)  │ (Web API)   │  (Web API)   │
└─────────────────────────────────────────┘
```

### 1.2 设计原则

| 原则 | 说明 |
|------|------|
| **统一接口** | 所有平台使用相同的 API 签名 |
| **透明适配** | 应用层无需关心底层实现 |
| **优雅降级** | Web 环境提供合理的替代方案 |
| **类型安全** | 保持 API 返回值的一致性 |
| **可扩展性** | 易于添加新平台支持 |

---

## 2. 模块结构

### 2.1 目录结构

```
src/adapters/
├── index.js              # 主入口，统一导出
├── platformDetector.js   # 平台检测模块
├── ipcAdapter.js         # IPC 通信适配
├── themeAdapter.js       # 主题适配
├── shellAdapter.js       # Shell 操作适配
├── dialogAdapter.js      # 对话框适配
└── appAdapter.js         # 应用信息适配
```

### 2.2 模块职责

| 模块 | 职责 | 核心能力 |
|------|------|----------|
| `platformDetector` | 平台检测与识别 | 检测 Electron/Web/Mobile |
| `ipcAdapter` | 进程间通信 | invoke/send/on/off |
| `themeAdapter` | 主题管理 | 暗色/亮色模式切换 |
| `shellAdapter` | 系统操作 | 打开链接/剪贴板/提示音 |
| `dialogAdapter` | 对话框 | 消息框/文件选择框 |
| `appAdapter` | 应用信息 | 版本/路径/存储 |

---

## 3. 核心组件设计

### 3.1 平台检测器 (platformDetector)

**检测逻辑**：
1. 优先检测 Electron 环境（通过 `window.require.electron`）
2. 通过 UserAgent 检测移动端
3. 默认视为 Web 环境

**核心 API**：
- `detectPlatform()` - 返回当前平台类型
- `isElectron()` / `isWeb()` / `isMobile()` - 平台判断
- `platform` - 平台常量

### 3.2 IPC 适配器 (ipcAdapter)

**设计要点**：
- Electron 环境直接使用 `ipcRenderer`
- Web 环境使用自定义事件总线模拟

**事件总线实现**：
- 使用 `CustomEvent` 实现跨页面通信
- Promise 封装支持异步调用
- 自动超时处理（5秒）

### 3.3 主题适配器 (themeAdapter)

**设计要点**：
- Electron：通过 IPC 获取原生主题
- Web：使用 CSS Media Query (`prefers-color-scheme`)
- 支持主题变化监听

**核心 API**：
- `shouldUseDarkColors` - 是否使用暗色模式
- `on('updated', callback)` - 监听主题变化
- `setThemeSource(source)` - 设置主题源

### 3.4 Shell 适配器 (shellAdapter)

**功能映射**：

| Electron API | Web 替代方案 |
|--------------|-------------|
| `openExternal` | `window.open()` |
| `beep` | Web Audio API |
| `writeText` | `navigator.clipboard` |
| `readText` | `navigator.clipboard` |
| `openPath` | 不支持（警告） |
| `showItemInFolder` | 不支持（警告） |

### 3.5 Dialog 适配器 (dialogAdapter)

**功能映射**：

| Electron API | Web 替代方案 |
|--------------|-------------|
| `showErrorBox` | `alert()` + console.error |
| `showMessageBox` | `confirm()` / `alert()` |
| `showOpenDialog` | `<input type="file">` |
| `showSaveDialog` | `<input type="file">` |

### 3.6 App 适配器 (appAdapter)

**存储抽象**：
- 使用 `localStorage` 持久化设置
- 使用 `sessionStorage` 存储临时数据
- 封装统一的 `storage` API

---

## 4. 数据流

### 4.1 初始化流程

```
应用启动
    │
    ▼
┌───────────────────────┐
│  platformDetector     │  检测当前平台
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│  各适配器初始化       │  根据平台选择实现
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│  应用层调用统一API    │  透明使用，无需关心平台
└───────────────────────┘
```

### 4.2 主题变化流程

```
系统主题变化
    │
    ├── Electron ──► nativeTheme.on('updated') ──► IPC通知渲染进程
    │
    └── Web ───────► MediaQueryList.change ──► 回调通知应用层
```

---

## 5. 集成方式

### 5.1 在 Vue 组件中使用

```javascript
import { platformAdapter } from '@/adapters'

export default {
  setup() {
    const { shell, dialog, platform } = platformAdapter
    
    const openLink = async (url) => {
      await shell.openExternal(url)
    }
    
    const showConfirm = async () => {
      const result = await dialog.showMessageBox({
        type: 'question',
        message: '确定要退出吗？',
        buttons: ['确定', '取消']
      })
      return result.response === 0
    }
    
    return {
      platform,
      openLink,
      showConfirm
    }
  }
}
```

### 5.2 在 Store 中使用

```javascript
import { storage } from '@/adapters'

const useSettingsStore = defineStore('settings', {
  state: () => ({
    theme: 'light',
    fontSize: 14
  }),
  
  actions: {
    loadSettings() {
      const saved = storage.get('chatall-settings')
      if (saved) {
        Object.assign(this, saved)
      }
    },
    
    saveSettings() {
      storage.set('chatall-settings', {
        theme: this.theme,
        fontSize: this.fontSize
      })
    }
  }
})
```

---

## 6. 兼容性矩阵

| API | Electron | Web | Mobile |
|-----|----------|-----|--------|
| ipcRenderer.invoke | ✅ | ✅ (模拟) | ✅ (模拟) |
| ipcRenderer.send | ✅ | ✅ (模拟) | ✅ (模拟) |
| nativeTheme | ✅ | ✅ | ✅ |
| shell.openExternal | ✅ | ✅ | ✅ |
| shell.writeText | ✅ | ✅ | ✅ |
| shell.beep | ✅ | ✅ (Web Audio) | ⚠️ |
| dialog.showMessageBox | ✅ | ✅ (原生弹窗) | ✅ |
| dialog.showOpenDialog | ✅ | ✅ (input) | ⚠️ |
| app.getVersion | ✅ | ✅ | ✅ |
| app.getPath | ✅ | ⚠️ (模拟路径) | ⚠️ |
| storage.set/get | ✅ | ✅ | ✅ |

> ✅ 完全支持 | ⚠️ 部分支持或降级 | ❌ 不支持

---

## 7. 扩展指南

### 7.1 添加新平台支持

1. 在 `platformDetector.js` 中添加新平台类型
2. 在各适配器中添加对应平台的实现分支
3. 更新兼容性矩阵文档

### 7.2 添加新 API

1. 在对应适配器模块中添加方法
2. 确保所有平台都有实现或降级方案
3. 在 `index.js` 中导出新 API
4. 更新 API 映射表文档

---

## 8. 安全考虑

### 8.1 XSS 防护
- 剪贴板操作使用原生 API，避免 DOM 注入
- 存储数据进行 JSON 序列化/反序列化

### 8.2 权限管理
- Web 环境中文件操作受浏览器沙箱限制
- 敏感操作需要用户交互触发

### 8.3 数据隔离
- 使用 `sessionStorage` 隔离临时数据
- 持久化数据使用加密存储（可选）

---

## 9. 性能优化

### 9.1 懒加载
- 适配器按需初始化
- 避免不必要的平台检测

### 9.2 缓存策略
- 平台检测结果缓存
- 主题状态缓存

### 9.3 事件优化
- 事件监听器自动清理
- 避免内存泄漏
