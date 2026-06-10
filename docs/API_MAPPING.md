# ChatALL Web Access API 映射表

## 概述

本文档详细描述 Electron API 与 Web 替代实现之间的映射关系，帮助开发者理解平台适配层的 API 设计。

---

## 1. ipcRenderer API 映射

| Electron API | Web 实现 | 返回值 | 文件位置 |
|--------------|----------|--------|----------|
| `ipcRenderer.on(channel, listener)` | CustomEvent 监听 | `ipcRenderer` (链式) | `ipcAdapter.js` |
| `ipcRenderer.off(channel, listener)` | 移除事件监听 | `ipcRenderer` (链式) | `ipcAdapter.js` |
| `ipcRenderer.send(channel, ...args)` | CustomEvent 触发 | `ipcRenderer` (链式) | `ipcAdapter.js` |
| `ipcRenderer.invoke(channel, ...args)` | Promise + 事件总线 | `Promise<any>` | `ipcAdapter.js` |
| `ipcRenderer.removeAllListeners(channel)` | 清空所有监听器 | `ipcRenderer` (链式) | `ipcAdapter.js` |
| `ipcRenderer.once(channel, listener)` | 单次监听后自动移除 | `ipcRenderer` (链式) | `ipcAdapter.js` |

**Web 实现原理**：
- 使用 `CustomEvent` 模拟 IPC 消息传递
- `invoke` 使用带超时的 Promise 模式
- 响应通道格式：`ipc:response:{channel}:{timestamp}`

---

## 2. nativeTheme API 映射

| Electron API | Web 实现 | 返回值 | 文件位置 |
|--------------|----------|--------|----------|
| `nativeTheme.shouldUseDarkColors` | `matchMedia('prefers-color-scheme')` | `boolean` | `themeAdapter.js` |
| `nativeTheme.themeSource` | 本地状态管理 | `string` | `themeAdapter.js` |
| `nativeTheme.on('updated', listener)` | MediaQueryList 监听 | `nativeTheme` (链式) | `themeAdapter.js` |
| `nativeTheme.setThemeSource(source)` | 更新本地状态 | `nativeTheme` (链式) | `themeAdapter.js` |

**Web 实现原理**：
- 使用 CSS Media Query 检测系统主题偏好
- 监听 `change` 事件响应主题变化

---

## 3. shell API 映射

| Electron API | Web 实现 | 返回值 | 文件位置 |
|--------------|----------|--------|----------|
| `shell.openExternal(url)` | `window.open(url, '_blank', 'noopener,noreferrer')` | `Promise<void>` | `shellAdapter.js` |
| `shell.openPath(path)` | 警告日志 | `Promise<string>` (空字符串) | `shellAdapter.js` |
| `shell.showItemInFolder(fullPath)` | 警告日志 | `Promise<void>` | `shellAdapter.js` |
| `shell.beep()` | Web Audio API (800Hz 正弦波) | `void` | `shellAdapter.js` |
| `shell.writeText(text)` | `navigator.clipboard.writeText()` | `Promise<void>` | `shellAdapter.js` |
| `shell.readText()` | `navigator.clipboard.readText()` | `Promise<string>` | `shellAdapter.js` |

**Web 实现原理**：
- 剪贴板操作使用 Clipboard API
- 提示音使用 Web Audio API 的 OscillatorNode
- 不支持的文件系统操作记录警告日志

---

## 4. dialog API 映射

| Electron API | Web 实现 | 返回值 | 文件位置 |
|--------------|----------|--------|----------|
| `dialog.showErrorBox(title, content)` | `alert()` + `console.error()` | `Promise<void>` | `dialogAdapter.js` |
| `dialog.showMessageBox(options)` | `confirm()` / `alert()` | `Promise<{ response: number }>` | `dialogAdapter.js` |
| `dialog.showOpenDialog(options)` | `<input type="file">` | `Promise<{ filePaths: string[], canceled: boolean }>` | `dialogAdapter.js` |
| `dialog.showSaveDialog(options)` | `<input type="file">` | `Promise<{ filePath: string, canceled: boolean }>` | `dialogAdapter.js` |
| `dialog.showMessageBoxSync(options)` | 同步 `confirm()` / `alert()` | `number` | `dialogAdapter.js` |
| `dialog.showOpenDialogSync(options)` | 警告日志 | `{ filePaths: [], canceled: true }` | `dialogAdapter.js` |
| `dialog.showSaveDialogSync(options)` | 警告日志 | `{ filePath: '', canceled: true }` | `dialogAdapter.js` |

**Web 实现原理**：
- 消息框使用原生 `alert()` / `confirm()`
- 文件选择使用 `<input type="file">` 元素
- Sync 方法在 Web 环境中返回降级结果

---

## 5. app API 映射

| Electron API | Web 实现 | 返回值 | 文件位置 |
|--------------|----------|--------|----------|
| `app.getVersion()` | `process.env.npm_package_version` | `string` | `appAdapter.js` |
| `app.getName()` | 硬编码 "ChatALL Web" | `string` | `appAdapter.js` |
| `app.getPath(name)` | 模拟路径映射 | `string` | `appAdapter.js` |
| `app.quit()` | 警告日志 | `void` | `appAdapter.js` |
| `app.relaunch()` | `window.location.reload()` | `void` | `appAdapter.js` |
| `app.setAppUserModelId(id)` | 空操作 | `void` | `appAdapter.js` |
| `app.on(event, listener)` | 事件监听映射 | `app` (链式) | `appAdapter.js` |
| `app.off(event, listener)` | 移除事件监听 | `app` (链式) | `appAdapter.js` |
| `app.isPackaged()` | `NODE_ENV === 'production'` | `boolean` | `appAdapter.js` |
| `app.getLocale()` | `navigator.language` | `string` | `appAdapter.js` |

**路径映射表**：

| 路径名称 | Web 环境返回值 |
|----------|---------------|
| `home` | `/` |
| `appData` | `/` |
| `userData` | `/` |
| `temp` | `/tmp` |
| `documents` | `/documents` |
| `downloads` | `/downloads` |

---

## 6. storage API (扩展)

平台适配层提供了统一的存储 API，作为 Electron 文件系统存储的 Web 替代方案：

| 方法 | 实现 | 返回值 | 文件位置 |
|------|------|--------|----------|
| `storage.set(key, value)` | `localStorage.setItem()` + JSON | `boolean` | `appAdapter.js` |
| `storage.get(key, defaultValue)` | `localStorage.getItem()` + JSON | `any` | `appAdapter.js` |
| `storage.remove(key)` | `localStorage.removeItem()` | `boolean` | `appAdapter.js` |
| `storage.clear()` | `localStorage.clear()` | `boolean` | `appAdapter.js` |
| `storage.setTemp(key, value)` | `sessionStorage.setItem()` + JSON | `boolean` | `appAdapter.js` |
| `storage.getTemp(key, defaultValue)` | `sessionStorage.getItem()` + JSON | `any` | `appAdapter.js` |
| `storage.removeTemp(key)` | `sessionStorage.removeItem()` | `boolean` | `appAdapter.js` |

**存储策略**：
- `storage.set/get` - 持久化存储（localStorage）
- `storage.setTemp/getTemp` - 临时存储（sessionStorage）
- 自动 JSON 序列化/反序列化
- 异常处理返回默认值

---

## 7. 平台检测 API

| 方法 | 功能 | 返回值 | 文件位置 |
|------|------|--------|----------|
| `detectPlatform()` | 检测当前平台 | `'electron' \| 'web' \| 'mobile'` | `platformDetector.js` |
| `isElectron()` | 是否 Electron | `boolean` | `platformDetector.js` |
| `isWeb()` | 是否 Web | `boolean` | `platformDetector.js` |
| `isMobile()` | 是否移动端 | `boolean` | `platformDetector.js` |
| `platform` | 当前平台常量 | `string` | `platformDetector.js` |

**检测优先级**：
1. 检测 `window.require?.electron?.ipcRenderer` → Electron
2. 检测 UserAgent 中的移动设备标识 → Mobile
3. 默认 → Web

---

## 8. API 使用示例

### 8.1 基础用法

```javascript
import { ipcRenderer, shell, dialog, app, storage, platform } from '@/adapters'

// 平台判断
if (platform === 'electron') {
  console.log('Running in Electron')
}

// IPC 通信
ipcRenderer.on('update-available', (event, info) => {
  console.log('Update available:', info)
})

await ipcRenderer.invoke('get-native-theme')

// Shell 操作
await shell.openExternal('https://chatall.ai')
await shell.writeText('Hello World')

// 对话框
const result = await dialog.showMessageBox({
  type: 'question',
  message: 'Confirm?',
  buttons: ['OK', 'Cancel']
})

// 应用信息
const version = app.getVersion()
const locale = app.getLocale()

// 存储
storage.set('settings', { theme: 'dark' })
const settings = storage.get('settings', { theme: 'light' })
```

### 8.2 在 Vue 组件中使用

```vue
<template>
  <div>
    <button @click="handleOpenLink">打开链接</button>
    <button @click="handleSaveSettings">保存设置</button>
  </div>
</template>

<script setup>
import { shell, storage, platform } from '@/adapters'

const handleOpenLink = async () => {
  await shell.openExternal('https://example.com')
}

const handleSaveSettings = () => {
  storage.set('user-preferences', {
    platform: platform,
    timestamp: Date.now()
  })
}
</script>
```

---

## 9. API 兼容性标记

| 标记 | 含义 |
|------|------|
| ✅ | 完全兼容 |
| ⚠️ | 部分兼容或降级实现 |
| ❌ | 不支持 |

**兼容性汇总**：

| 模块 | 兼容性 | 说明 |
|------|--------|------|
| ipcRenderer | ✅ | 事件总线模拟 |
| nativeTheme | ✅ | MediaQuery 模拟 |
| shell | ⚠️ | 文件操作不支持 |
| dialog | ⚠️ | 同步方法降级 |
| app | ⚠️ | 路径返回模拟值 |
| storage | ✅ | 完全支持 |

---

## 10. 错误处理

所有异步 API 都返回 Promise，并在 Web 环境中提供优雅的错误处理：

```javascript
try {
  await shell.openExternal(url)
} catch (error) {
  console.warn('Failed to open URL:', error)
  // 降级处理
}
```

**Web 环境特有限制**：
- 文件系统访问受浏览器安全策略限制
- 剪贴板操作需要用户交互触发
- 跨域限制可能影响某些功能
