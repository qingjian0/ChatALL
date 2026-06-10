import { log, logWarn, logError, logInfo, sanitizeLog } from "./logSanitizer";
import { securityMonitor } from "./securityMonitor";

const DEFAULT_MAX_REQUEST_SIZE = 10 * 1024 * 1024;
const DEFAULT_RATE_LIMIT = 100;
const DEFAULT_RATE_WINDOW = 60 * 1000;
const DEFAULT_TIMEOUT = 60000;

class CorsProxy {
  constructor() {
    this.allowedOrigins = new Set();
    this.blockedOrigins = new Set();
    this.requestLog = [];
    this.rateLimitCache = new Map();
    this.maxRequestSize = DEFAULT_MAX_REQUEST_SIZE;
    this.rateLimit = DEFAULT_RATE_LIMIT;
    this.rateWindow = DEFAULT_RATE_WINDOW;
    this.timeout = DEFAULT_TIMEOUT;
    this.enabled = true;
    
    // 用户自定义代理配置
    this.customProxies = new Map();
    this.activeProxy = null;
    this.fallbackProxies = [];
    
    // 目标 API 白名单
    this.allowedTargets = new Set([
      'api.openai.com',
      'api.anthropic.com',
      'generativelanguage.googleapis.com',
      'api.groq.com',
      'api.cohere.com',
      'api.moonshot.cn',
      'spark-api.xfyun.cn',
      'aip.baidubce.com',
      'dashscope.aliyuncs.com',
      'api.perplexity.ai',
    ]);
    
    // 熔断机制
    this.circuitBreaker = {
      enabled: false,
      lastFailTime: 0,
      failCount: 0,
      resetTimeout: 30000,
      failThreshold: 5,
    };
    
    this.loadWhitelist();
  }

  loadWhitelist() {
    const defaultOrigins = [
      "https://chatall.app",
      "https://www.chatall.app",
      "https://chatall-web.vercel.app",
      "http://localhost:8080",
      "http://localhost:3000",
    ];
    
    defaultOrigins.forEach((origin) => this.allowedOrigins.add(origin));
  }

  setWhitelist(origins) {
    this.allowedOrigins.clear();
    origins.forEach((origin) => this.allowedOrigins.add(origin));
    logInfo("[CORS] Whitelist updated:", origins.length, "domains");
  }

  addOrigin(origin) {
    if (this.blockedOrigins.has(origin)) {
      logWarn("[CORS] Attempted to add blocked origin:", origin);
      return false;
    }
    this.allowedOrigins.add(origin);
    return true;
  }

  blockOrigin(origin) {
    this.blockedOrigins.add(origin);
    this.allowedOrigins.delete(origin);
    logWarn("[CORS] Origin blocked:", origin);
  }

  isOriginAllowed(origin) {
    if (!origin) return false;
    
    if (this.blockedOrigins.has(origin)) {
      return false;
    }
    
    if (this.allowedOrigins.has(origin)) {
      return true;
    }
    
    const wildcardMatch = Array.from(this.allowedOrigins).some((allowed) => {
      if (allowed.endsWith("*")) {
        const prefix = allowed.slice(0, -1);
        return origin.startsWith(prefix);
      }
      return false;
    });
    
    return wildcardMatch;
  }

  isTargetAllowed(targetHost) {
    return this.allowedTargets.has(targetHost);
  }

  addAllowedTarget(host) {
    this.allowedTargets.add(host);
    logInfo("[CORS] Target host added:", host);
  }

  removeAllowedTarget(host) {
    this.allowedTargets.delete(host);
    logInfo("[CORS] Target host removed:", host);
  }

  checkRateLimit(origin) {
    const now = Date.now();
    const windowStart = now - this.rateWindow;
    
    if (!this.rateLimitCache.has(origin)) {
      this.rateLimitCache.set(origin, []);
    }
    
    const requests = this.rateLimitCache.get(origin);
    const recentRequests = requests.filter((r) => r > windowStart);
    
    if (recentRequests.length >= this.rateLimit) {
      return { 
        allowed: false, 
        remaining: 0, 
        resetTime: windowStart + this.rateWindow,
        retryAfter: Math.ceil((windowStart + this.rateWindow - now) / 1000)
      };
    }
    
    requests.push(now);
    
    if (requests.length > this.rateLimit * 2) {
      this.rateLimitCache.set(origin, recentRequests);
    }
    
    return { 
      allowed: true, 
      remaining: this.rateLimit - recentRequests.length,
      resetTime: windowStart + this.rateWindow,
      retryAfter: 0
    };
  }

  validateRequest(request) {
    const { origin, referer, method, contentLength, url } = request;
    
    const validation = {
      valid: true,
      errors: [],
      warnings: [],
    };

    if (!this.enabled) {
      validation.valid = false;
      validation.errors.push("CORS proxy is disabled");
      return validation;
    }

    if (!this.isOriginAllowed(origin)) {
      validation.valid = false;
      validation.errors.push(`Origin not allowed: ${origin}`);
      securityMonitor.reportAnomaly({
        type: "cors_origin_blocked",
        origin,
        timestamp: Date.now(),
      });
    }

    if (referer && !referer.startsWith(origin)) {
      validation.warnings.push(`Referer mismatch: ${referer}`);
    }

    const allowedMethods = ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"];
    if (!allowedMethods.includes(method)) {
      validation.valid = false;
      validation.errors.push(`Method not allowed: ${method}`);
    }

    if (contentLength && contentLength > this.maxRequestSize) {
      validation.valid = false;
      validation.errors.push(`Request size exceeds limit: ${contentLength}`);
    }

    if (url) {
      try {
        const targetUrl = new URL(url);
        if (!this.isTargetAllowed(targetUrl.hostname)) {
          validation.valid = false;
          validation.errors.push(`Target host not allowed: ${targetUrl.hostname}`);
        }
      } catch {
        validation.warnings.push("Invalid URL format");
      }
    }

    const rateLimitResult = this.checkRateLimit(origin);
    if (!rateLimitResult.allowed) {
      validation.valid = false;
      validation.errors.push("Rate limit exceeded");
      securityMonitor.reportAnomaly({
        type: "rate_limit_exceeded",
        origin,
        timestamp: Date.now(),
      });
    }

    return { ...validation, rateLimit: rateLimitResult };
  }

  async validateProxy(proxyUrl) {
    try {
      const url = new URL(proxyUrl);
      
      // 验证 URL 格式
      if (!['http:', 'https:'].includes(url.protocol)) {
        return { valid: false, error: 'Proxy URL must use HTTP or HTTPS' };
      }
      
      // 尝试连接验证
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        const response = await fetch(proxyUrl, {
          method: 'HEAD',
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        return { valid: true, responseCode: response.status };
      } catch (error) {
        clearTimeout(timeoutId);
        return { valid: false, error: `Connection failed: ${error.message}` };
      }
    } catch (error) {
      return { valid: false, error: `Invalid URL: ${error.message}` };
    }
  }

  addCustomProxy(name, config) {
    const validation = this.validateProxyConfig(config);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    
    this.customProxies.set(name, {
      ...config,
      createdAt: Date.now(),
      lastUsed: null,
      successCount: 0,
      failCount: 0,
    });
    
    logInfo("[CORS] Custom proxy added:", name);
    return { success: true };
  }

  validateProxyConfig(config) {
    if (!config.url) {
      return { valid: false, error: 'Proxy URL is required' };
    }
    
    if (!config.name) {
      return { valid: false, error: 'Proxy name is required' };
    }
    
    try {
      new URL(config.url);
    } catch {
      return { valid: false, error: 'Invalid proxy URL format' };
    }
    
    if (config.timeout && (typeof config.timeout !== 'number' || config.timeout < 1000)) {
      return { valid: false, error: 'Timeout must be at least 1000ms' };
    }
    
    return { valid: true };
  }

  removeCustomProxy(name) {
    if (this.customProxies.delete(name)) {
      logInfo("[CORS] Custom proxy removed:", name);
      if (this.activeProxy === name) {
        this.activeProxy = null;
      }
      return true;
    }
    return false;
  }

  setActiveProxy(name) {
    if (this.customProxies.has(name)) {
      this.activeProxy = name;
      logInfo("[CORS] Active proxy set to:", name);
      return true;
    }
    return false;
  }

  addFallbackProxy(name) {
    if (this.customProxies.has(name) && !this.fallbackProxies.includes(name)) {
      this.fallbackProxies.push(name);
      logInfo("[CORS] Fallback proxy added:", name);
      return true;
    }
    return false;
  }

  removeFallbackProxy(name) {
    const index = this.fallbackProxies.indexOf(name);
    if (index > -1) {
      this.fallbackProxies.splice(index, 1);
      logInfo("[CORS] Fallback proxy removed:", name);
      return true;
    }
    return false;
  }

  getActiveProxyConfig() {
    if (this.activeProxy && this.customProxies.has(this.activeProxy)) {
      return this.customProxies.get(this.activeProxy);
    }
    return null;
  }

  async getNextFallbackProxy() {
    for (const proxyName of this.fallbackProxies) {
      const proxy = this.customProxies.get(proxyName);
      if (proxy) {
        const health = await this.checkProxyHealth(proxy.url);
        if (health.healthy) {
          return proxy;
        }
      }
    }
    return null;
  }

  async checkProxyHealth(proxyUrl) {
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(proxyUrl, {
        method: 'HEAD',
        signal: controller.signal,
      });
      
      return {
        healthy: response.ok,
        statusCode: response.status,
        latency: Date.now(),
      };
    } catch {
      return { healthy: false, statusCode: null, latency: null };
    }
  }

  recordProxyUsage(proxyName, success) {
    const proxy = this.customProxies.get(proxyName);
    if (proxy) {
      proxy.lastUsed = Date.now();
      if (success) {
        proxy.successCount++;
      } else {
        proxy.failCount++;
      }
      
      // 更新熔断状态
      if (!success) {
        this.circuitBreaker.failCount++;
        this.circuitBreaker.lastFailTime = Date.now();
        
        if (this.circuitBreaker.failCount >= this.circuitBreaker.failThreshold) {
          this.circuitBreaker.enabled = true;
          logWarn("[CORS] Circuit breaker triggered");
        }
      } else {
        this.circuitBreaker.failCount = 0;
        this.circuitBreaker.enabled = false;
      }
    }
  }

  isCircuitBreakerTripped() {
    if (!this.circuitBreaker.enabled) {
      return false;
    }
    
    const now = Date.now();
    if (now - this.circuitBreaker.lastFailTime >= this.circuitBreaker.resetTimeout) {
      this.circuitBreaker.enabled = false;
      this.circuitBreaker.failCount = 0;
      return false;
    }
    
    return true;
  }

  logRequest(requestInfo) {
    const logEntry = {
      ...requestInfo,
      timestamp: Date.now(),
      id: this.generateRequestId(),
    };
    
    this.requestLog.push(logEntry);
    
    if (this.requestLog.length > 1000) {
      this.requestLog.shift();
    }
    
    log("[CORS] Request:", sanitizeLog(logEntry));
    
    securityMonitor.trackRequest({
      url: requestInfo.url,
      method: requestInfo.method,
      timestamp: logEntry.timestamp,
      statusCode: requestInfo.statusCode,
    });
  }

  generateRequestId() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => 
      byte.toString(16).padStart(2, "0")
    ).join("");
  }

  getProxyStats() {
    const now = Date.now();
    const lastHour = now - 60 * 60 * 1000;
    const lastDay = now - 24 * 60 * 60 * 1000;
    
    const recentRequests = this.requestLog.filter((r) => r.timestamp > lastHour);
    const dailyRequests = this.requestLog.filter((r) => r.timestamp > lastDay);
    
    return {
      totalRequests: this.requestLog.length,
      requestsLastHour: recentRequests.length,
      requestsLastDay: dailyRequests.length,
      allowedOrigins: this.allowedOrigins.size,
      blockedOrigins: this.blockedOrigins.size,
      allowedTargets: this.allowedTargets.size,
      customProxies: this.customProxies.size,
      activeProxy: this.activeProxy,
      rateLimitedRequests: recentRequests.filter((r) => r.statusCode === 429).length,
      errorRequests: recentRequests.filter((r) => r.statusCode >= 500).length,
      circuitBreakerTripped: this.isCircuitBreakerTripped(),
    };
  }

  getCustomProxiesList() {
    return Array.from(this.customProxies.entries()).map(([name, config]) => ({
      name,
      ...config,
    }));
  }

  setRateLimit(limit, windowMs = DEFAULT_RATE_WINDOW) {
    this.rateLimit = limit;
    this.rateWindow = windowMs;
    logInfo("[CORS] Rate limit updated:", `${limit} requests/${windowMs / 1000}s`);
  }

  setMaxRequestSize(bytes) {
    this.maxRequestSize = bytes;
    logInfo("[CORS] Max request size updated:", `${bytes / 1024 / 1024}MB`);
  }

  setTimeout(timeoutMs) {
    this.timeout = timeoutMs;
    logInfo("[CORS] Timeout updated:", `${timeoutMs / 1000}s`);
  }

  setCircuitBreakerConfig(config) {
    this.circuitBreaker = {
      ...this.circuitBreaker,
      ...config,
    };
    logInfo("[CORS] Circuit breaker config updated:", config);
  }

  enable() {
    this.enabled = true;
    logInfo("[CORS] Proxy enabled");
  }

  disable() {
    this.enabled = false;
    logInfo("[CORS] Proxy disabled");
  }

  clearLogs() {
    this.requestLog = [];
    this.rateLimitCache.clear();
  }

  clearRateLimitCache() {
    this.rateLimitCache.clear();
    logInfo("[CORS] Rate limit cache cleared");
  }

  destroy() {
    this.allowedOrigins.clear();
    this.blockedOrigins.clear();
    this.allowedTargets.clear();
    this.requestLog = [];
    this.rateLimitCache.clear();
    this.customProxies.clear();
    this.activeProxy = null;
    this.fallbackProxies = [];
  }
}

export const corsProxy = new CorsProxy();

export default CorsProxy;