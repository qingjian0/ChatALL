const CSP = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", "data:", "https:", "blob:"],
  fontSrc: ["'self'", "data:"],
  connectSrc: [
    "'self'",
    "https://api.openai.com",
    "https://api.anthropic.com",
    "https://generativelanguage.googleapis.com",
    "https://*.azure.com",
    "https://api.groq.com",
    "https://api.deepseek.com",
    "https://open.bigmodel.cn",
    "https://ark.cn-beijing.volces.com",
    "https://dashscope.aliyuncs.com",
    "https://spark-api-open.xf-yun.com",
    "https://claude.ai",
    "https://kimi.moonshot.cn",
    "https://chat.deepseek.com",
    "https://*.minimaxi.com",
    "https://*.botqq.com",
    "https://*.baidu.com",
    "https://*.zhipuai.cn",
    "https://*.google.com",
    "https://*.bing.com",
    "https://*.huggingface.co",
    "https://*.perplexity.ai",
    "https://*.you.com",
    "https://*.x.ai",
    "https://*.mistral.ai",
    "https://*.cohere.ai",
    "https://chatall-proxy.workers.dev",
    "https://api.chatall.app",
  ],
  frameSrc: ["'self'", "https:", "about:"],
  mediaSrc: ["'self'", "data:", "https:"],
  objectSrc: ["'none'"],
  workerSrc: ["'self'", "blob:"],
  frameAncestors: ["'self'"],
  baseUri: ["'self'"],
  formAction: ["'self'"],
  upgradeInsecureRequests: [],
};

function buildCspString(csp) {
  const directives = [];

  for (const [directive, values] of Object.entries(csp)) {
    if (Array.isArray(values)) {
      const kebab = directive.replace(/([A-Z])/g, "-$1").toLowerCase();
      if (values.length === 0) {
        directives.push(kebab);
      } else {
        directives.push(`${kebab} ${values.join(" ")}`);
      }
    }
  }

  return directives.join("; ");
}

export const CSP_STRING = buildCspString(CSP);

export function getMetaTag() {
  return `<meta http-equiv="Content-Security-Policy" content="${CSP_STRING}">`;
}

export function getHeaders() {
  return {
    "Content-Security-Policy": CSP_STRING,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  };
}

export function addConnectSrc(url) {
  if (url && !CSP.connectSrc.includes(url)) {
    CSP.connectSrc.push(url);
  }
}

export function isConnectAllowed(url) {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    for (const allowed of CSP.connectSrc) {
      if (allowed === "'self'") continue;

      if (allowed.startsWith("*.")) {
        const base = allowed.slice(2);
        if (hostname === base || hostname.endsWith("." + base)) {
          return true;
        }
      } else if (allowed.includes("://")) {
        try {
          const allowedUrl = new URL(allowed);
          if (allowedUrl.hostname === hostname) {
            return true;
          }
        } catch (e) {}
      } else if (allowed === hostname) {
        return true;
      }
    }
    return false;
  } catch (e) {
    return false;
  }
}

export default {
  CSP,
  CSP_STRING,
  getMetaTag,
  getHeaders,
  addConnectSrc,
  isConnectAllowed,
};
