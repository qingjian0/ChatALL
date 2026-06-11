import { ref } from 'vue'

const encryptionKey = ref(null)
const isAuthenticated = ref(false)

export async function generateKey(password) {
  const encoder = new TextEncoder()
  const passwordBytes = encoder.encode(password)
  const salt = encoder.encode('chatall-web-access')
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBytes,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )
  
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  )
  
  return key
}

export async function encryptData(data, key) {
  const encoder = new TextEncoder()
  const dataBytes = encoder.encode(JSON.stringify(data))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    dataBytes
  )
  
  return {
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(encrypted))
  }
}

export async function decryptData(encryptedData, key) {
  const iv = new Uint8Array(encryptedData.iv)
  const data = new Uint8Array(encryptedData.data)
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    data
  )
  
  const decoder = new TextDecoder()
  return JSON.parse(decoder.decode(decrypted))
}

export async function authenticate(password) {
  try {
    const key = await generateKey(password)
    encryptionKey.value = key
    isAuthenticated.value = true
    return true
  } catch (e) {
    console.error('[Secure Store] Authentication failed:', e)
    return false
  }
}

export function logout() {
  encryptionKey.value = null
  isAuthenticated.value = false
}

export async function secureStore(key, value) {
  if (!encryptionKey.value) {
    throw new Error('Not authenticated')
  }
  
  if (value === undefined) {
    const encrypted = localStorage.getItem(key)
    if (!encrypted) return null
    return decryptData(JSON.parse(encrypted), encryptionKey.value)
  }
  
  const encrypted = await encryptData(value, encryptionKey.value)
  localStorage.setItem(key, JSON.stringify(encrypted))
}

export const secureStoreModule = {
  encryptionKey,
  isAuthenticated,
  authenticate,
  logout,
  secureStore,
  generateKey,
  encryptData,
  decryptData,
}

export default secureStoreModule