class LRUCache {
  constructor(maxSize = 100) {
    this.cache = new Map()
    this.maxSize = maxSize
  }

  get(key) {
    if (!this.cache.has(key)) return null

    const value = this.cache.get(key)
    this.cache.delete(key)
    this.cache.set(key, value)
    return value
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    this.cache.set(key, value)
  }

  has(key) {
    return this.cache.has(key)
  }

  delete(key) {
    return this.cache.delete(key)
  }

  clear() {
    this.cache.clear()
  }

  get size() {
    return this.cache.size
  }
}

const chatCache = new LRUCache(50)
const botConfigCache = new LRUCache(100)
const apiResponseCache = new LRUCache(200)

export { LRUCache, chatCache, botConfigCache, apiResponseCache }

export function cacheChatMessages(chatId, messages) {
  chatCache.set(`chat:${chatId}`, {
    messages,
    timestamp: Date.now()
  })
}

export function getCachedChatMessages(chatId) {
  const cached = chatCache.get(`chat:${chatId}`)
  if (!cached) return null
  
  const age = Date.now() - cached.timestamp
  if (age > 5 * 60 * 1000) {
    chatCache.delete(`chat:${chatId}`)
    return null
  }
  return cached.messages
}

export function cacheBotConfig(botId, config) {
  botConfigCache.set(`bot:${botId}`, {
    config,
    timestamp: Date.now()
  })
}

export function getCachedBotConfig(botId) {
  const cached = botConfigCache.get(`bot:${botId}`)
  if (!cached) return null
  
  const age = Date.now() - cached.timestamp
  if (age > 30 * 60 * 1000) {
    botConfigCache.delete(`bot:${botId}`)
    return null
  }
  return cached.config
}

export function cacheApiResponse(url, response, ttl = 60000) {
  apiResponseCache.set(url, {
    response,
    timestamp: Date.now(),
    ttl
  })
}

export function getCachedApiResponse(url) {
  const cached = apiResponseCache.get(url)
  if (!cached) return null
  
  const age = Date.now() - cached.timestamp
  if (age > cached.ttl) {
    apiResponseCache.delete(url)
    return null
  }
  return cached.response
}

export function cleanupCaches() {
  const now = Date.now()
  
  for (const [key, value] of chatCache.cache) {
    if (now - value.timestamp > 10 * 60 * 1000) {
      chatCache.delete(key)
    }
  }
  
  for (const [key, value] of botConfigCache.cache) {
    if (now - value.timestamp > 60 * 60 * 1000) {
      botConfigCache.delete(key)
    }
  }
  
  for (const [key, value] of apiResponseCache.cache) {
    if (now - value.timestamp > value.ttl) {
      apiResponseCache.delete(key)
    }
  }
}

setInterval(cleanupCaches, 5 * 60 * 1000)