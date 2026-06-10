const ENCRYPTION_SALT = 'chatall-secure-salt-2024'

async function generateKeyFromPassword(password) {
  const encoder = new TextEncoder()
  const passwordBytes = encoder.encode(password)
  const saltBytes = encoder.encode(ENCRYPTION_SALT)

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBytes,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  )
}

let cachedKey = null

export const secureStorage = {
  async init(password) {
    try {
      cachedKey = await generateKeyFromPassword(password)
      return true
    } catch (error) {
      console.error('Failed to initialize secure storage:', error)
      return false
    }
  },

  async encrypt(data) {
    if (!cachedKey) {
      throw new Error('Secure storage not initialized')
    }

    const encoder = new TextEncoder()
    const dataBytes = encoder.encode(JSON.stringify(data))
    const iv = crypto.getRandomValues(new Uint8Array(12))

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      cachedKey,
      dataBytes
    )

    const encryptedArray = new Uint8Array(encrypted)
    const combined = new Uint8Array(iv.length + encryptedArray.length)
    combined.set(iv, 0)
    combined.set(encryptedArray, iv.length)

    return btoa(String.fromCharCode(...combined))
  },

  async decrypt(encryptedData) {
    if (!cachedKey) {
      throw new Error('Secure storage not initialized')
    }

    try {
      const decoded = new Uint8Array(
        atob(encryptedData).split('').map((char) => char.charCodeAt(0))
      )

      const iv = decoded.slice(0, 12)
      const data = decoded.slice(12)

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        cachedKey,
        data
      )

      const decoder = new TextDecoder()
      return JSON.parse(decoder.decode(decrypted))
    } catch (error) {
      console.error('Decryption failed:', error)
      throw new Error('Invalid password or corrupted data')
    }
  },

  setItem(key, value) {
    return new Promise((resolve, reject) => {
      try {
        this.encrypt(value).then((encrypted) => {
          localStorage.setItem(`chatall-secure-${key}`, encrypted)
          resolve()
        }).catch(reject)
      } catch (error) {
        reject(error)
      }
    })
  },

  getItem(key) {
    return new Promise((resolve, reject) => {
      try {
        const encrypted = localStorage.getItem(`chatall-secure-${key}`)
        if (!encrypted) {
          resolve(null)
          return
        }
        this.decrypt(encrypted).then(resolve).catch(reject)
      } catch (error) {
        reject(error)
      }
    })
  },

  removeItem(key) {
    localStorage.removeItem(`chatall-secure-${key}`)
  },

  clear() {
    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith('chatall-secure-')
    )
    keys.forEach((key) => localStorage.removeItem(key))
  },

  clearKey() {
    cachedKey = null
  },

  maskValue(value) {
    if (!value) return ''
    const str = String(value)
    if (str.length <= 8) return '*'.repeat(str.length)
    return str.slice(0, 4) + '*'.repeat(str.length - 8) + str.slice(-4)
  },

  generateToken(length = 32) {
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)
    return Array.from(array, (byte) =>
      byte.toString(16).padStart(2, '0')
    ).join('')
  },
}
