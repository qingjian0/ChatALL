import axios from 'axios'

const instance = axios.create({
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
})

instance.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

instance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      console.error('[API] Response error:', error.response.status, error.response.data)
    } else if (error.request) {
      console.error('[API] Request error:', error.request)
    } else {
      console.error('[API] Error:', error.message)
    }
    return Promise.reject(error)
  }
)

export async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  let lastError
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options)
      if (response.ok) {
        return response
      }
      if (response.status === 429 || (response.status >= 500 && response.status < 600)) {
        lastError = new Error(`HTTP ${response.status}`)
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)))
          continue
        }
      }
      throw new Error(`HTTP ${response.status}`)
    } catch (error) {
      lastError = error
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)))
      }
    }
  }
  
  throw lastError
}

export function debounce(fn, delay = 300) {
  let timer = null
  return function(...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

export function throttle(fn, limit = 100) {
  let inThrottle = false
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

export function formatDate(date) {
  const d = new Date(date)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function formatTime(date) {
  const d = new Date(date)
  return d.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

export function mergeDeep(target, source) {
  const result = { ...target }
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && !(source[key] instanceof Array)) {
      result[key] = mergeDeep(target[key] || {}, source[key])
    } else {
      result[key] = source[key]
    }
  }
  return result
}

export function isEmpty(obj) {
  return obj === null || obj === undefined || 
    (typeof obj === 'object' && Object.keys(obj).length === 0) ||
    (typeof obj === 'string' && obj.trim() === '')
}

export function truncate(text, maxLength = 100) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export { instance as axios }
export default instance