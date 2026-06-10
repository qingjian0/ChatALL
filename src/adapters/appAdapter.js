import { isElectron } from './platformDetector'

function safeRequireElectron() {
  try {
    if (isElectron() && typeof window.require === 'function') {
      return window.require('electron')
    }
  } catch (e) {
    // Web environment
  }
  return null
}

const app = {
  getVersion: function () {
    const electron = safeRequireElectron()
    if (electron?.app) {
      return electron.app.getVersion()
    }
    try {
      return process.env.npm_package_version || '1.0.0'
    } catch (e) {
      return '1.0.0'
    }
  },

  getName: function () {
    const electron = safeRequireElectron()
    if (electron?.app) {
      return electron.app.getName()
    }
    return 'ChatALL Web'
  },

  getPath: function (name) {
    const electron = safeRequireElectron()
    if (electron?.app) {
      return electron.app.getPath(name)
    }
    const paths = {
      home: '/',
      appData: '/',
      userData: '/',
      temp: '/tmp',
      documents: '/documents',
      downloads: '/downloads',
    }
    return paths[name] || '/'
  },

  quit: function () {
    const electron = safeRequireElectron()
    if (electron?.app) {
      electron.app.quit()
    } else {
      console.warn('app.quit is not applicable in web environment')
    }
  },

  relaunch: function () {
    const electron = safeRequireElectron()
    if (electron?.app) {
      electron.app.relaunch()
      electron.app.quit()
    } else {
      window.location.reload()
    }
  },

  setAppUserModelId: function (id) {
    const electron = safeRequireElectron()
    if (electron?.app) {
      electron.app.setAppUserModelId(id)
    }
  },

  on: function (event, listener) {
    const electron = safeRequireElectron()
    if (electron?.app) {
      electron.app.on(event, listener)
    } else {
      if (event === 'ready') {
        setTimeout(listener, 0)
      } else if (event === 'window-all-closed') {
        window.addEventListener('beforeunload', listener)
      }
    }
    return app
  },

  off: function (event, listener) {
    const electron = safeRequireElectron()
    if (electron?.app) {
      electron.app.off(event, listener)
    } else {
      if (event === 'window-all-closed') {
        window.removeEventListener('beforeunload', listener)
      }
    }
    return app
  },

  isPackaged: function () {
    const electron = safeRequireElectron()
    if (electron?.app) {
      return electron.app.isPackaged
    }
    return process.env.NODE_ENV === 'production'
  },

  getLocale: function () {
    const electron = safeRequireElectron()
    if (electron?.app) {
      return electron.app.getLocale()
    }
    return navigator.language || 'en'
  },
}

const storage = {
  set: function (key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error('Failed to set storage:', error)
      return false
    }
  },

  get: function (key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error('Failed to get storage:', error)
      return defaultValue
    }
  },

  remove: function (key) {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error('Failed to remove storage:', error)
      return false
    }
  },

  clear: function () {
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.error('Failed to clear storage:', error)
      return false
    }
  },

  setTemp: function (key, value) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error('Failed to set temp storage:', error)
      return false
    }
  },

  getTemp: function (key, defaultValue = null) {
    try {
      const item = sessionStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error('Failed to get temp storage:', error)
      return defaultValue
    }
  },

  removeTemp: function (key) {
    try {
      sessionStorage.removeItem(key)
      return true
    } catch (error) {
      console.error('Failed to remove temp storage:', error)
      return false
    }
  },
}

export { app, storage }
