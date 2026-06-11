import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as secureStore from '@/security/secureStore'

export const useSecureStore = defineStore('secure', () => {
  const isAuthenticated = ref(false)
  const encryptionKey = ref(null)

  async function authenticate(password) {
    try {
      const key = await secureStore.generateKey(password)
      encryptionKey.value = key
      isAuthenticated.value = true
      return true
    } catch (e) {
      console.error('[Secure Store] Authentication failed:', e)
      return false
    }
  }

  function logout() {
    encryptionKey.value = null
    isAuthenticated.value = false
  }

  async function encryptAndStore(key, value) {
    if (!encryptionKey.value) {
      throw new Error('Not authenticated')
    }
    const encrypted = await secureStore.encryptData(value, encryptionKey.value)
    localStorage.setItem(key, JSON.stringify(encrypted))
  }

  async function decryptAndLoad(key) {
    if (!encryptionKey.value) {
      throw new Error('Not authenticated')
    }
    const stored = localStorage.getItem(key)
    if (!stored) return null
    const encrypted = JSON.parse(stored)
    return secureStore.decryptData(encrypted, encryptionKey.value)
  }

  return {
    isAuthenticated,
    encryptionKey,
    authenticate,
    logout,
    encryptAndStore,
    decryptAndLoad,
  }
})