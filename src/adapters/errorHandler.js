export const ErrorCode = {
  SUCCESS: 0,
  UNKNOWN: 1000,
  INVALID_PARAMS: 1001,
  NOT_SUPPORTED: 1002,
  PLATFORM_NOT_AVAILABLE: 1003,
  PERMISSION_DENIED: 1004,
  NETWORK_ERROR: 2001,
  TIMEOUT: 2002,
  CORS_BLOCKED: 2003,
  STORAGE_ERROR: 3001,
  STORAGE_QUOTA: 3002,
  FILE_SYSTEM_ERROR: 3003,
  DIALOG_CANCELLED: 4001,
  DIALOG_ERROR: 4002,
  IPC_ERROR: 5001,
  THEME_ERROR: 6001,
  SHELL_ERROR: 7001,
}

export class AdapterError extends Error {
  constructor(message, code = ErrorCode.UNKNOWN, details = {}) {
    super(message)
    this.name = 'AdapterError'
    this.code = code
    this.details = details
    this.timestamp = Date.now()
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp,
    }
  }

  toString() {
    return `[AdapterError:${this.code}] ${this.message}`
  }
}

export function createError(message, code, details) {
  return new AdapterError(message, code, details)
}

export function wrapError(error, fallbackMessage, fallbackCode = ErrorCode.UNKNOWN) {
  if (error instanceof AdapterError) {
    return error
  }
  
  const message = error?.message || fallbackMessage || 'Unknown error'
  const details = {
    originalError: error?.message,
    originalStack: error?.stack,
    originalName: error?.name,
  }
  
  return new AdapterError(message, fallbackCode, details)
}

export function createNotSupportedError(feature) {
  return new AdapterError(
    `${feature} is not supported in this environment`,
    ErrorCode.NOT_SUPPORTED,
    { feature }
  )
}

export function createPlatformError(feature) {
  return new AdapterError(
    `${feature} is not available`,
    ErrorCode.PLATFORM_NOT_AVAILABLE,
    { feature }
  )
}

export function createTimeoutError(feature) {
  return new AdapterError(
    `${feature} operation timed out`,
    ErrorCode.TIMEOUT,
    { feature }
  )
}

export function handleAdapterCall(adapterName, fn) {
  return (...args) => {
    try {
      return fn(...args)
    } catch (error) {
      console.warn(`[${adapterName}]`, error?.message || error)
      throw wrapError(error, 'Adapter call failed')
    )
  }
}

export function safeExecute(fn, defaultValue = null) {
  try {
    const result = fn()
    if (result instanceof Promise) {
      return result.catch(e => {
        console.warn('[safeExecute]', e?.message || e)
        return defaultValue
      })
    }
    return result
  } catch (e) {
    console.warn('[safeExecute]', e?.message || e)
    return defaultValue
  }
}

export function withRetry(fn, maxRetries = 3, delayMs = 100) {
  return async function(...args) {
    let lastError
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn(...args)
      } catch (error) {
        lastError = error
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delayMs * (i + 1))
        }
      }
    }
    throw lastError
  }
}

export const ErrorHandler = {
  ErrorCode,
  create: createError,
  wrap: wrapError,
  wrapError,
  safeExecute,
  withRetry,
}

export default {
  ErrorCode,
  AdapterError,
  createError,
  wrapError,
  safeExecute,
  withRetry,
  ErrorHandler,
}
