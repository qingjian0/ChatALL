# ChatALL 项目技术规范文档

> 本文档详细记录 ChatALL 项目的架构、配置规范、Fork 修复指南及问题排查流程。

---

## 目录

1. [项目概述](#1-项目概述)
2. [技术栈架构](#2-技术栈架构)
3. [Electron 配置详解](#3-electron-配置详解)
4. [关键文件说明](#4-关键文件说明)
5. [Fork 仓库修复指南](#5-fork-仓库修复指南)
6. [白屏问题排查](#6-白屏问题排查)
7. [CI/CD 配置说明](#7-cicd-配置说明)
8. [版本发布流程](#8-版本发布流程)

---

## 1. 项目概述

**ChatALL** 是一个多 AI 聊天客户端，可以同时与多个 AI Bot 对话，帮助用户发现最佳回答。

- **当前版本**: 1.86.8
- **Node 版本**: ^20
- **Electron 版本**: 33.4.11
- **构建工具**: vue-cli-plugin-electron-builder

---

## 2. 技术栈架构

### 2.1 前端框架

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.5.16 | 核心框架 |
| Vuetify | 3.8.8 | UI 组件库 |
| Vuex | 4.1.0 | 状态管理 |
| vuex-persist | 3.1.3 | 状态持久化 |
| vue-i18n | 11.1.5 | 国际化 |
| Dexie | 4.0.11 | IndexedDB ORM |

### 2.2 Electron 相关

| 技术 | 版本 | 用途 |
|------|------|------|
| Electron | 33.4.11 | 桌面运行时 |
| vue-cli-plugin-electron-builder | 3.0.0-alpha.4 | Electron 构建插件 |
| electron-builder | 25.1.8 | 应用打包 |

### 2.3 项目目录结构

```
ChatALL/
├── .github/
│   └── workflows/
│       ├── release.yml      # 发布工作流
│       ├── deploy.yml       # 部署工作流
│       └── static.yml       # 静态资源工作流
├── public/
│   ├── index.html           # HTML 模板
│   └── bots/                # Bot 图标资源
├── src/
│   ├── assets/              # 静态资源（图标等）
│   ├── bots/                # Bot 实现
│   │   ├── index.js         # Bot 导出
│   │   ├── Bot.js           # Bot 基类
│   │   ├── anthropic/       # Claude 系列
│   │   ├── openai/          # ChatGPT 系列
│   │   ├── deepseek/        # DeepSeek 系列
│   │   └── ...              # 其他 Bot
│   ├── components/          # Vue 组件
│   │   ├── BotSettings/     # Bot 设置组件
│   │   ├── ChatDrawer/      # 聊天抽屉
│   │   ├── Messages/        # 消息组件
│   │   └── ...
│   ├── composables/         # Vue Composables
│   ├── helpers/             # 工具函数
│   ├── i18n/               # 国际化
│   │   └── locales/
│   │       ├── zh.json     # 中文
│   │       └── en.json     # 英文
│   ├── prompts/            # 提示词模板
│   ├── store/              # Vuex Store
│   │   ├── index.js        # 主 Store
│   │   ├── chats.js        # 聊天状态
│   │   ├── messages.js     # 消息状态
│   │   └── threads.js      # 线程状态
│   ├── App.vue             # 根组件
│   ├── main.js             # Vue 入口
│   ├── background.js       # Electron 主进程
│   ├── preload.js          # 预加载脚本
│   ├── menu.js             # 菜单配置
│   ├── theme.js             # 主题配置
│   └── update.js           # 更新逻辑
├── package.json            # 项目配置
└── vue.config.js           # Vue CLI 配置
```

---

## 3. Electron 配置详解

### 3.1 vue.config.js 配置

```javascript
// vue.config.js
module.exports = defineConfig({
  transpileDependencies: ["vuetify"],
  pluginOptions: {
    electronBuilder: {
      // 主进程入口文件
      mainProcessFile: "src/background.js",
      
      // 预加载脚本（关键配置）
      mainProcessPreload: "src/preload.js",
      
      builderOptions: {
        appId: "ai.chatall",           // Electron Builder 应用 ID
        productName: "ChatALL",        // 产品名称
        compression: "maximum",         // 压缩级别
        
        // macOS 配置
        mac: {
          category: "public.app-category.utilities",
          target: "default",
          icon: "src/assets/icon.icns",
        },
        
        // Windows 配置
        win: {
          target: [{ target: "nsis", arch: ["x64"] }],
          icon: "src/assets/icon.ico",
        },
        
        // Linux 配置
        linux: {
          target: ["AppImage", "deb"],
        },
        
        // NSIS 安装程序配置
        nsis: {
          oneClick: false,
          allowToChangeInstallationDirectory: true,
        },
      },
      
      // 关键：修复 CSS 资源加载问题
      customFileProtocol: "./",
    },
  },
});
```

### 3.2 background.js 主进程配置

```javascript
// src/background.js
async function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    backgroundColor: nativeTheme.shouldUseDarkColors ? "#1a1a20" : "#fff",
    show: false,  // 等待 ready-to-show 再显示
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      // 预加载脚本路径（必须使用 __dirname）
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // 监听加载失败
  win.webContents.on("did-fail-load", (event, errorCode, errorDesc) => {
    console.error(`[Electron] 加载失败: ${errorCode} - ${errorDesc}`);
  });

  // 监听崩溃
  win.webContents.on("crashed", (event, killed) => {
    console.error(`[Electron] 渲染进程${killed ? "被杀死" : "崩溃"}`);
  });

  // 白屏防护：等待内容加载完成再显示
  win.once("ready-to-show", () => {
    win.show();
  });

  // 加载内容
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
  } else {
    await win.loadURL("app://./index.html");
  }
}
```

### 3.3 preload.js 配置

```javascript
// src/preload.js
const { contextBridge, ipcRenderer } = require("electron");

// 暴露 electron 对象给渲染进程
contextBridge.exposeInMainWorld("require", {
  electron: {
    ipcRenderer,
  },
});

// IPC 事件转发
ipcRenderer.on("commit", (event, mutation, value) => {
  ipcRenderer.send("commit", mutation, value);
});
```

---

## 4. 关键文件说明

### 4.1 package.json 关键字段

```json
{
  "name": "chatall",
  "version": "1.86.8",
  "repository": {
    "type": "git",
    "url": "https://github.com/qingjian0/ChatALL.git"
  },
  "engines": {
    "node": "^20"
  },
  "scripts": {
    "serve": "vue-cli-service serve",
    "build": "vue-cli-service build",
    "electron:build": "vue-cli-service electron:build",
    "release-all": "vue-cli-service electron:build -wml --x64 --arm64",
    "release-macos": "vue-cli-service electron:build --mac --x64 --arm64",
    "release-linux": "vue-cli-service electron:build --linux --x64 --arm64",
    "release-windows": "vue-cli-service electron:build --win --x64 --arm64"
  }
}
```

### 4.2 main.js 初始化顺序

```javascript
// src/main.js

// 1. 等待 Vuex store 恢复状态
await store.restored;

// 2. 恢复语言设置
i18n.global.locale.value = store.state.lang;

// 3. 执行数据迁移
store.commit("migrateSettingsPrompts");
store.commit("migrateSettingArrayIndexUseUUID");
await migrateChatsMessagesThreads();
await Chats.addFirstChatIfEmpty();

// 4. 解析主题
const defaultTheme = await resolveTheme(store.state.mode, ipcRenderer);

// 5. 创建 Vuetify 实例
const vuetify = createVuetify({ /* ... */ });

// 6. 应用主题
store.commit("setTheme", defaultTheme);
applyTheme(defaultTheme, vuetify);

// 7. 设置菜单栏
ipcRenderer.invoke("set-is-show-menu-bar", store.state.general.isShowMenuBar);

// 8. 挂载 Vue 应用
createApp(App)
  .use(i18n)
  .use(store)
  .use(vuetify)
  .mount("#app");
```

### 4.3 theme.js 主题配置

```javascript
// src/theme.js
export const resolveTheme = async (mode, ipcRenderer) => {
  let resolvedTheme = mode;
  if (mode === Mode.SYSTEM) {
    const nativeTheme = await ipcRenderer.invoke("get-native-theme");
    resolvedTheme = nativeTheme.shouldUseDarkColors ? Theme.DARK : Theme.LIGHT;
  }
  return resolvedTheme;
};

export const applyTheme = (theme, vuetifyTheme) => {
  if (vuetifyTheme) {
    vuetifyTheme.global.name.value = theme;
  }
};
```

---

## 5. Fork 仓库修复指南

### 5.1 问题描述

Fork 仓库后直接构建发布，会遇到以下错误：

```
HttpError: 403 Forbidden
"method: post url: https://api.github.com/repos/ai-shifu/ChatALL/releases
Data: {"message":"Resource not accessible by integration","status":"403"}"
```

### 5.2 根本原因

Fork 仓库时，以下字段保留原值：

| 字段 | 问题 |
|------|------|
| `repository.url` | 指向原始仓库，无发布权限 |
| `bugs.url` | 指向原始仓库 |
| `homepage` | 可能指向原始项目 |

### 5.3 修复步骤

#### Step 1: 修改 package.json

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_USERNAME/ChatALL.git"
  }
}
```

#### Step 2: 检查其他可能指向原仓库的字段

```json
{
  "bugs": {
    "url": "https://github.com/YOUR_USERNAME/ChatALL/issues"
  },
  "homepage": "https://github.com/YOUR_USERNAME/ChatALL#readme"
}
```

#### Step 3: 在 vue.config.js 中显式声明发布目标

```javascript
builderOptions: {
  publish: [
    {
      provider: 'github',
      owner: 'YOUR_USERNAME',
      repo: 'ChatALL'
    }
  ]
}
```

#### Step 4: 验证修复

```bash
# 检查 package.json 中的仓库地址
node -p "require('./package.json').repository.url"

# 应该输出你的 fork 仓库地址
# 例如: https://github.com/qingjian0/ChatALL.git
```

---

## 6. 白屏问题排查

### 6.1 排查流程图

```
┌─────────────────────────────────────────────────────────────────┐
│                     白屏问题排查流程                              │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 1: 检查 preload.js 路径                                     │
│ ────────────────────────────────────────────────                 │
│ background.js 中是否使用 path.join(__dirname, "preload.js")？     │
│ 错误: preload: "./preload.js"     ← 相对路径，打包后失效          │
│ 正确: preload: path.join(__dirname, "preload.js")  ← 绝对路径    │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 2: 检查 vue.config.js customFileProtocol                    │
│ ────────────────────────────────────────────────                 │
│ 是否配置了 customFileProtocol: "./" ？                            │
│ 作用: 修复 CSS 中 app:// 协议资源加载问题                          │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 3: 检查 mainProcessPreload 字段名                           │
│ ────────────────────────────────────────────────                 │
│ 错误: preload: "src/preload.js"      ← 字段名错误                  │
│ 正确: mainProcessPreload: "src/preload.js"  ← 正确字段名         │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 4: 检查 main.js 异步初始化                                   │
│ ────────────────────────────────────────────────                 │
│ 是否正确处理了 store.restored 等待？                               │
│ 是否在 createVuetify 后调用 applyTheme？                          │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 5: 查看 Electron 主进程日志                                  │
│ ────────────────────────────────────────────────                 │
│ 开发模式: npm run electron:serve                                  │
│ 日志位置: DevTools Console                                       │
│ 关键日志:                                                        │
│   - [Electron] Web contents failed to load                       │
│   - [Electron] Renderer process crashed                          │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 常见白屏原因及解决方案

| 原因 | 症状 | 解决方案 |
|------|------|----------|
| preload 路径错误 | `did-fail-load` 错误 | 使用 `path.join(__dirname, "preload.js")` |
| customFileProtocol 缺失 | CSS 资源加载失败 | 添加 `customFileProtocol: "./"` |
| 字段名错误 | preload 未生效 | 使用 `mainProcessPreload` |
| store 未恢复就挂载 | 应用状态异常 | `await store.restored` 后再挂载 |
| theme 函数参数缺失 | 主题不生效 | `applyTheme(theme, vuetify)` 传两个参数 |

### 6.3 开发模式调试

```bash
# 启动开发服务器
npm run electron:serve

# 打开 DevTools 查看日志
# Windows/Linux: Ctrl+Shift+I
# macOS: Cmd+Option+I

# 关键日志关键词
# - [Electron] Web contents failed to load
# - [Electron] Renderer process crashed
# - Error: Cannot find module
```

### 6.4 生产模式调试

1. 查看构建产物是否完整：
```bash
ls -la dist_electron/
```

2. 检查 index.html 是否存在：
```bash
find dist_electron -name "index.html"
```

3. 启动应用并捕获日志：
```bash
./ChatALL --enable-logging 2>&1 | tee app.log
```

---

## 7. CI/CD 配置说明

### 7.1 GitHub Actions 工作流

```yaml
# .github/workflows/release.yml
name: Build and Release

on:
  push:
    tags:
      - "v*.*.*"  # 推送 v 开头的 tag 触发

permissions:
  contents: write  # 需要写入权限发布 Release

jobs:
  # macOS 构建
  build-macos:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "20.x"
      - name: Install dependencies
        run: npm install
      - name: Build macOS
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: npm run release-macos
      - uses: actions/upload-artifact@v4
        with:
          name: macos-build
          path: dist_electron/*.dmg

  # Linux 构建
  build-linux:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "20.x"
      - name: Install dependencies
        run: npm install
      - name: Build Linux
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: npm run release-linux
      - uses: actions/upload-artifact@v4
        with:
          name: linux-build
          path: dist_electron/*.AppImage

  # Windows 构建
  build-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "20.x"
      - name: Install dependencies
        run: npm install
      - name: Build Windows
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: npm run release-windows
      - uses: actions/upload-artifact@v4
        with:
          name: windows-build
          path: dist_electron/*.exe

  # Release 发布
  release:
    needs: [build-macos, build-linux, build-windows]
    runs-on: ubuntu-latest
    if: always()
    steps:
      - uses: actions/download-artifact@v4
        with:
          path: dist_electron
      - uses: softprops/action-gh-release@v1
        with:
          tag_name: ${{ github.ref_name }}
          name: "ChatALL ${{ github.ref_name }}"
          files: |
            dist_electron/macos-build/*
            dist_electron/linux-build/*
            dist_electron/windows-build/*
```

### 7.2 版本号与 Tag 对应关系

| Tag | package.json version | 说明 |
|-----|---------------------|------|
| v1.86.7 | 1.86.7 | 正常 |
| v1.86.8 | 1.86.8 | 正常 |
| v1.86.9 | 1.86.8 | ❌ 版本不一致导致构建失败 |
| v1.86.10 | 1.86.8 | ✅ 构建成功 |

**注意**: electron-builder 使用 `package.json` 的 `version` 字段命名产物，而非 git tag。

### 7.3 CI/CD 前置检查

在 `.github/workflows/release.yml` 中添加验证步骤：

```yaml
jobs:
  pre-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Validate repository configuration
        run: |
          REPO_URL=$(node -p "require('./package.json').repository.url")
          CURRENT_REPO="${{ github.repository }}"
          
          if [[ "$REPO_URL" != *"$CURRENT_REPO"* ]]; then
            echo "❌ package.json repository 与当前仓库不匹配"
            exit 1
          fi
```

---

## 8. 版本发布流程

### 8.1 发布检查清单

| 步骤 | 操作 | 验证 |
|------|------|------|
| 1 | 更新 `package.json` 版本号 | `node -p "require('./package.json').version"` |
| 2 | 更新 `package-lock.json` 版本号 | `grep '"version"' package-lock.json \| head -1` |
| 3 | 验证 `repository.url` 指向正确仓库 | `node -p "require('./package.json').repository.url"` |
| 4 | 本地测试构建 | `npm run build` |
| 5 | 提交更改 | `git add . && git commit -m "chore: bump version"` |
| 6 | 创建 tag | `git tag v1.x.x` |
| 7 | 推送 tag | `git push origin v1.x.x` |
| 8 | 等待 CI 完成 | 检查 GitHub Actions 状态 |
| 9 | 验证 Release | 检查 GitHub Releases 页面 |

### 8.2 版本号规范

遵循语义化版本 (Semantic Versioning):

```
主版本.次版本.修订号
v1.86.8
 │   │   │
 │   │   └── 修订号: 日常 bug 修复
 │   └───── 次版本: 新功能 (可能 breaking change)
 └───────── 主版本: 重大架构变更
```

### 8.3 快速发布命令

```bash
# 1. 更新版本号 (假设新版本为 1.87.0)
NEW_VERSION=1.87.0

# 2. 更新 package.json
sed -i "s/\"version\": \"[0-9.]*\"/\"version\": \"$NEW_VERSION\"/" package.json

# 3. 更新 package-lock.json
sed -i "s/\"version\": \"[0-9.]*\"/\"version\": \"$NEW_VERSION\"/" package-lock.json

# 4. 提交
git add package.json package-lock.json
git commit -m "chore: bump version to $NEW_VERSION"
git tag "v$NEW_VERSION"
git push origin "v$NEW_VERSION"
```

---

## 附录 A: 关键依赖版本

| 依赖 | 版本 | 用途 |
|------|------|------|
| electron | 33.4.11 | 桌面运行时 |
| vue-cli-plugin-electron-builder | 3.0.0-alpha.4 | 构建插件 |
| electron-builder | 25.1.8 | 打包工具 |
| vue | 3.5.16 | 前端框架 |
| vuetify | 3.8.8 | UI 组件 |
| vuex | 4.1.0 | 状态管理 |
| vue-i18n | 11.1.5 | 国际化 |
| dexie | 4.0.11 | IndexedDB |
| langchain | 0.3.27 | AI 集成 |
| @langchain/anthropic | 0.3.21 | Claude |
| @langchain/openai | 0.5.12 | OpenAI |

## 附录 B: 常见错误代码

| 错误代码 | 含义 | 解决方案 |
|----------|------|----------|
| 403 | 无权限发布到指定仓库 | 修改 `package.json.repository` |
| ENOENT | 文件未找到 | 检查构建产物路径 |
| MODULE_NOT_FOUND | 模块未安装 | 重新 `npm install` |
| EADDRINUSE | 端口被占用 | 关闭占用端口的进程 |

## 附录 C: 联系与支持

- **GitHub Issues**: https://github.com/qingjian0/ChatALL/issues
- **官方文档**: https://github.com/sudoskys/ChatALL

---

*本文档最后更新: 2026-06-10*
