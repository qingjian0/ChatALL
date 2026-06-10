import { isElectron } from './platformDetector'

const app = {
  getVersion: function () {
    if (isElectron()) {
      const { app } = window.require('electron')
      return app.getVersion()
    } else {
      try {
        return process.env.npm_package_version || '1.0.0'
      } catch (e) {
        return '1.0.0'
      }
    }
  },

  getName: function () {
    if (isElectron()) {
      const { app } = window.require('electron')
      return app.getName()
    } else {
      return 'ChatALL Web'
    }
  },

  getPath: function (name) {
    if (isElectron()) {
      const { app } = window.require('electron')
      return app.getPath(name)
    } else {
      const paths = {
        home: '/',
        appData: '/',
        userData: '/',
        temp: '/tmp',
        documents: '/documents',
        downloads: '/downloads',
      }
      return paths[name] || '/'
    }
  },

  quit: function () {
    if (isElectron()) {
      const { app } = window.require('electron')
      app.quit()
    } else {
      console.warn('app.quit is not applicable in web environment')
    }
  },

  relaunch: function () {
    if (isElectron()) {
      const { app } = window.require('electron')
      app.relaunch()
      app.quit()
    } else {
      window.location.reload()
    }
  },

  setAppUserModelId: function (id) {
    if (isElectron()) {
      const { app } = window.require('electron')
      app.setAppUserModelId(id)
    }
  },

  on: function (event, listener) {
    if (isElectron()) {
      const { app } = window.require('electron')
      app.on(event, listener)
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
    if (isElectron()) {
      const { app } = window.require('electron')
      app.off(event, listener)
    } else {
      if (event === 'window-all-closed') {
        window.removeEventListener('beforeunload', listener)
      }
    }
    return app
  },

  isPackaged: function () {
    if (isElectron()) {
      const { app } = window.require('electron')
      return app.isPackaged
    } else {
      return process.env.NODE_ENV === 'production'
    }
  },

  getLocale: function () {
    if (isElectron()) {
      const { app } = window.require('electron')
      return app.getLocale()
    } else {
      return navigator.language || 'en'
    }
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
