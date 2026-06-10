import localforage from 'localforage'

const STORAGE_KEYS = {
  SETTINGS: 'chatall-settings',
  BOT_CONFIGS: 'chatall-bot-configs',
  CHATS: 'chatall-chats',
  MESSAGES: 'chatall-messages',
  SECURE_PREFIX: 'chatall-secure-',
}

const MEMORY_CACHE = new Map()
const CACHE_TTL = 5 * 60 * 1000

const indexedDBStore = localforage.createInstance({
  name: 'ChatALL',
  version: 1.0,
  storeName: 'chatall-store',
  description: 'ChatALL application data store',
})

export const storage = {
  async setItem(key, value) {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value)
      localStorage.setItem(key, stringValue)
      MEMORY_CACHE.set(key, {
        value,
        timestamp: Date.now(),
        source: 'localStorage',
      })
      return true
    } catch (error) {
      console.error('Failed to set item:', error)
      return false
    }
  },

  getItem(key) {
    const cached = MEMORY_CACHE.get(key)
    if (cached) {
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.value
      }
      MEMORY_CACHE.delete(key)
    }

    try {
      const stored = localStorage.getItem(key)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          MEMORY_CACHE.set(key, {
            value: parsed,
            timestamp: Date.now(),
            source: 'localStorage',
          })
          return parsed
        } catch {
          MEMORY_CACHE.set(key, {
            value: stored,
            timestamp: Date.now(),
            source: 'localStorage',
          })
          return stored
        }
      }
      return null
    } catch (error) {
      console.error('Failed to get item:', error)
      return null
    }
  },

  removeItem(key) {
    try {
      localStorage.removeItem(key)
      MEMORY_CACHE.delete(key)
      return true
    } catch (error) {
      console.error('Failed to remove item:', error)
      return false
    }
  },

  clear() {
    try {
      localStorage.clear()
      MEMORY_CACHE.clear()
      return true
    } catch (error) {
      console.error('Failed to clear storage:', error)
      return false
    }
  },

  async setSessionItem(key, value) {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value)
      sessionStorage.setItem(key, stringValue)
      MEMORY_CACHE.set(`session:${key}`, {
        value,
        timestamp: Date.now(),
        source: 'sessionStorage',
      })
      return true
    } catch (error) {
      console.error('Failed to set session item:', error)
      return false
    }
  },

  getSessionItem(key) {
    const cached = MEMORY_CACHE.get(`session:${key}`)
    if (cached) {
      return cached.value
    }

    try {
      const stored = sessionStorage.getItem(key)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          MEMORY_CACHE.set(`session:${key}`, {
            value: parsed,
            timestamp: Date.now(),
            source: 'sessionStorage',
          })
          return parsed
        } catch {
          MEMORY_CACHE.set(`session:${key}`, {
            value: stored,
            timestamp: Date.now(),
            source: 'sessionStorage',
          })
          return stored
        }
      }
      return null
    } catch (error) {
      console.error('Failed to get session item:', error)
      return null
    }
  },

  removeSessionItem(key) {
    try {
      sessionStorage.removeItem(key)
      MEMORY_CACHE.delete(`session:${key}`)
      return true
    } catch (error) {
      console.error('Failed to remove session item:', error)
      return false
    }
  },

  clearSession() {
    try {
      sessionStorage.clear()
      Array.from(MEMORY_CACHE.keys()).forEach(key => {
        if (key.startsWith('session:')) {
          MEMORY_CACHE.delete(key)
        }
      })
      return true
    } catch (error) {
      console.error('Failed to clear session:', error)
      return false
    }
  },

  async setIndexedDBItem(key, value) {
    try {
      await indexedDBStore.setItem(key, value)
      MEMORY_CACHE.set(`idb:${key}`, {
        value,
        timestamp: Date.now(),
        source: 'indexedDB',
      })
      return true
    } catch (error) {
      console.error('Failed to set indexedDB item:', error)
      return false
    }
  },

  async getIndexedDBItem(key) {
    const cached = MEMORY_CACHE.get(`idb:${key}`)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.value
    }

    try {
      const value = await indexedDBStore.getItem(key)
      if (value !== null) {
        MEMORY_CACHE.set(`idb:${key}`, {
          value,
          timestamp: Date.now(),
          source: 'indexedDB',
        })
      }
      return value
    } catch (error) {
      console.error('Failed to get indexedDB item:', error)
      return null
    }
  },

  async removeIndexedDBItem(key) {
    try {
      await indexedDBStore.removeItem(key)
      MEMORY_CACHE.delete(`idb:${key}`)
      return true
    } catch (error) {
      console.error('Failed to remove indexedDB item:', error)
      return false
    }
  },

  async clearIndexedDB() {
    try {
      await indexedDBStore.clear()
      Array.from(MEMORY_CACHE.keys()).forEach(key => {
        if (key.startsWith('idb:')) {
          MEMORY_CACHE.delete(key)
        }
      })
      return true
    } catch (error) {
      console.error('Failed to clear indexedDB:', error)
      return false
    }
  },

  setMemoryCache(key, value, ttl = CACHE_TTL) {
    MEMORY_CACHE.set(key, {
      value,
      timestamp: Date.now(),
      ttl,
      source: 'memory',
    })
  },

  getMemoryCache(key) {
    const cached = MEMORY_CACHE.get(key)
    if (!cached) return null

    const now = Date.now()
    if (cached.ttl && now - cached.timestamp > cached.ttl) {
      MEMORY_CACHE.delete(key)
      return null
    }

    return cached.value
  },

  removeMemoryCache(key) {
    MEMORY_CACHE.delete(key)
  },

  clearMemoryCache() {
    MEMORY_CACHE.clear()
  },

  async clearExpiredCache() {
    const now = Date.now()
    Array.from(MEMORY_CACHE.entries()).forEach(([key, item]) => {
      if (item.ttl && now - item.timestamp > item.ttl) {
        MEMORY_CACHE.delete(key)
      }
    })
  },

  async backupData() {
    try {
      const data = {
        settings: this.getItem(STORAGE_KEYS.SETTINGS),
        botConfigs: this.getItem(STORAGE_KEYS.BOT_CONFIGS),
        timestamp: Date.now(),
      }
      return data
    } catch (error) {
      console.error('Failed to backup data:', error)
      return null
    }
  },

  async restoreData(data) {
    try {
      if (data.settings) {
        await this.setItem(STORAGE_KEYS.SETTINGS, data.settings)
      }
      if (data.botConfigs) {
        await this.setItem(STORAGE_KEYS.BOT_CONFIGS, data.botConfigs)
      }
      return true
    } catch (error) {
      console.error('Failed to restore data:', error)
      return false
    }
  },

  async getStorageInfo() {
    try {
      const info = {
        localStorage: {
          keys: Object.keys(localStorage).filter(k => k.startsWith('chatall-')),
          count: Object.keys(localStorage).filter(k => k.startsWith('chatall-')).length,
        },
        sessionStorage: {
          keys: Object.keys(sessionStorage).filter(k => k.startsWith('chatall-')),
          count: Object.keys(sessionStorage).filter(k => k.startsWith('chatall-')).length,
        },
        memoryCache: {
          keys: Array.from(MEMORY_CACHE.keys()),
          count: MEMORY_CACHE.size,
        },
      }
      return info
    } catch (error) {
      console.error('Failed to get storage info:', error)
      return null
    }
  },

  async migrateFromLocalStorageToIndexedDB() {
    try {
      const settings = this.getItem(STORAGE_KEYS.SETTINGS)
      const botConfigs = this.getItem(STORAGE_KEYS.BOT_CONFIGS)

      if (settings) {
        await this.setIndexedDBItem(STORAGE_KEYS.SETTINGS, settings)
      }
      if (botConfigs) {
        await this.setIndexedDBItem(STORAGE_KEYS.BOT_CONFIGS, botConfigs)
      }

      return true
    } catch (error) {
      console.error('Failed to migrate data:', error)
      return false
    }
  },
}

export { STORAGE_KEYS }
export default storage