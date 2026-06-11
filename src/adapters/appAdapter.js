import { isElectron } from './platformDetector'

let electronApp = null

try {
  if (isElectron() && typeof window.require === 'function') {
    const { app } = window.require('electron').remote || window.require('electron')
    electronApp = app
  }
} catch (e) {
  console.warn('[App Adapter] Electron App not available')
}

const storage = {
  getItem: (key) => {
    try {
      const value = localStorage.getItem(key)
      if (value) {
        return JSON.parse(value)
      }
      return null
    } catch (e) {
      return localStorage.getItem(key)
    }
  },

  setItem: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      localStorage.setItem(key, String(value))
    }
  },

  removeItem: (key) => {
    localStorage.removeItem(key)
  },

  clear: () => {
    localStorage.clear()
  },

  getAllKeys: () => {
    return Object.keys(localStorage)
  }
}

const app = {
  getName: () => {
    if (electronApp) {
      return electronApp.getName()
    }
    return 'ChatALL'
  },

  getVersion: () => {
    if (electronApp) {
      return electronApp.getVersion()
    }
    try {
      return require('../../package.json').version
    } catch (e) {
      return '3.0.0'
    }
  },

  quit: () => {
    if (electronApp) {
      electronApp.quit()
      return
    }
    console.warn('[App Adapter] quit not supported in web')
  },

  relaunch: () => {
    if (electronApp) {
      electronApp.relaunch()
      electronApp.quit()
      return
    }
    window.location.reload()
  },

  getPath: (pathName) => {
    if (electronApp) {
      return electronApp.getPath(pathName)
    }
    console.warn(`[App Adapter] getPath(${pathName}) not supported in web`)
    return null
  },

  setBadgeCount: (count) => {
    if (electronApp) {
      return electronApp.setBadgeCount(count)
    }
    if (document.title) {
      document.title = count > 0 ? `(${count}) ChatALL` : 'ChatALL'
    }
  },

  storage
}

export { app, storage }
export default app