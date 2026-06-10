addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

// 配置常量
const CONFIG = {
  // 允许的源域名白名单
  ALLOWED_ORIGINS: [
    'https://chatall.app',
    'https://www.chatall.app',
    'https://chatall-web.vercel.app',
    'https://chatall-git-main-sunnercn.vercel.app',
    'http://localhost:8080',
    'http://localhost:3000',
  ],
  
  // 允许的目标 API 域名
  ALLOWED_TARGETS: [
    'api.openai.com',
    'api.anthropic.com',
    'generativelanguage.googleapis.com',
    'api.groq.com',
    'api.cohere.com',
    'api.moonshot.cn',
    'spark-api.xfyun.cn',
    'aip.baidubce.com',
    'dashscope.aliyuncs.com',
    'api.together.xyz',
    'api.perplexity.ai',
  ],
  
  // 速率限制配置
  RATE_LIMIT: {
    requests: 100,
    windowSeconds: 60,
  },
  
  // 最大请求大小 (10MB)
  MAX_REQUEST_SIZE: 10 * 1024 * 1024,
  
  // 请求超时时间 (60秒)
  REQUEST_TIMEOUT: 60,
};

// 存储速率限制状态（使用 Durable Objects 或 Cloudflare KV）
const rateLimitStore = new Map();

/**
 * 处理请求
 */
async function handleRequest(request) {
  const { method, url, headers } = request;
  
  // 处理 OPTIONS 请求（CORS 预检）
  if (method === 'OPTIONS') {
    return handleOptionsRequest(request);
  }
  
  try {
    // 验证请求
    const validation = await validateRequest(request);
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: validation.status,
        headers: getCorsHeaders(headers.get('Origin')),
      });
    }
    
    // 执行速率限制检查
    const rateLimitResult = checkRateLimit(headers.get('Origin') || 'unknown');
    if (!rateLimitResult.allowed) {
      return new Response(JSON.stringify({
        error: 'Rate limit exceeded',
        retryAfter: rateLimitResult.retryAfter,
      }), {
        status: 429,
        headers: {
          ...getCorsHeaders(headers.get('Origin')),
          'Retry-After': rateLimitResult.retryAfter.toString(),
        },
      });
    }
    
    // 转发请求到目标 API
    const response = await forwardRequest(request);
    
    // 返回响应
    return new Response(response.body, {
      status: response.status,
      headers: {
        ...response.headers,
        ...getCorsHeaders(headers.get('Origin')),
        'X-Proxy-Id': generateProxyId(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
      },
    });
    
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(JSON.stringify({ error: 'Proxy internal error' }), {
      status: 500,
      headers: getCorsHeaders(headers.get('Origin')),
    });
  }
}

/**
 * 处理 OPTIONS 请求
 */
function handleOptionsRequest(request) {
  const origin = request.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);
  
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

/**
 * 获取 CORS 响应头
 */
function getCorsHeaders(origin) {
  const allowedOrigin = CONFIG.ALLOWED_ORIGINS.includes(origin) ? origin : '*';
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-Custom-Header, X-API-Key',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
    'X-Proxy-Version': '1.0.0',
  };
}

/**
 * 验证请求
 */
async function validateRequest(request) {
  const { method, url, headers } = request;
  const origin = headers.get('Origin');
  
  // 检查来源是否允许
  if (origin && !CONFIG.ALLOWED_ORIGINS.includes(origin)) {
    return { valid: false, error: 'Origin not allowed', status: 403 };
  }
  
  // 解析目标 URL
  const targetUrl = new URL(url);
  const targetHost = targetUrl.hostname;
  
  // 检查目标是否在允许列表中
  if (!CONFIG.ALLOWED_TARGETS.includes(targetHost)) {
    return { valid: false, error: 'Target host not allowed', status: 403 };
  }
  
  // 检查请求方法
  const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'];
  if (!allowedMethods.includes(method)) {
    return { valid: false, error: 'Method not allowed', status: 405 };
  }
  
  // 检查请求大小
  const contentLength = headers.get('Content-Length');
  if (contentLength && parseInt(contentLength) > CONFIG.MAX_REQUEST_SIZE) {
    return { valid: false, error: 'Request size exceeds limit', status: 413 };
  }
  
  return { valid: true };
}

/**
 * 检查速率限制
 */
function checkRateLimit(origin) {
  const now = Date.now();
  const windowStart = now - (CONFIG.RATE_LIMIT.windowSeconds * 1000);
  
  if (!rateLimitStore.has(origin)) {
    rateLimitStore.set(origin, { requests: [], lastReset: now });
  }
  
  const clientData = rateLimitStore.get(origin);
  const recentRequests = clientData.requests.filter((r) => r > windowStart);
  
  if (recentRequests.length >= CONFIG.RATE_LIMIT.requests) {
    return {
      allowed: false,
      retryAfter: Math.ceil((windowStart + CONFIG.RATE_LIMIT.windowSeconds * 1000 - now) / 1000),
      remaining: 0,
    };
  }
  
  clientData.requests.push(now);
  
  // 清理旧记录
  if (clientData.requests.length > CONFIG.RATE_LIMIT.requests * 2) {
    clientData.requests = recentRequests;
  }
  
  return {
    allowed: true,
    retryAfter: 0,
    remaining: CONFIG.RATE_LIMIT.requests - recentRequests.length,
  };
}

/**
 * 转发请求到目标 API
 */
async function forwardRequest(request) {
  const { method, headers, body } = request;
  
  // 构建目标 URL
  const url = new URL(request.url);
  const targetUrl = `${url.protocol}//${url.host}${url.pathname}${url.search}`;
  
  // 过滤掉内部代理头
  const filteredHeaders = new Headers(headers);
  filteredHeaders.delete('Origin');
  filteredHeaders.delete('Referer');
  filteredHeaders.delete('Host');
  
  // 添加代理标识头
  filteredHeaders.set('X-Forwarded-For', request.headers.get('CF-Connecting-IP') || 'unknown');
  filteredHeaders.set('X-Forwarded-Proto', 'https');
  filteredHeaders.set('X-Proxy-Source', 'cloudflare-worker');
  
  // 创建转发请求
  const forwardRequest = new Request(targetUrl, {
    method,
    headers: filteredHeaders,
    body: method !== 'GET' && method !== 'HEAD' ? body : null,
    redirect: 'follow',
    signal: AbortSignal.timeout(CONFIG.REQUEST_TIMEOUT * 1000),
  });
  
  // 发送请求
  return await fetch(forwardRequest);
}

/**
 * 生成代理 ID
 */
function generateProxyId() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => 
    byte.toString(16).padStart(2, '0')
  ).join('');
}

// 导出模块（用于 ES 模块环境）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    handleRequest,
    CONFIG,
  };
}