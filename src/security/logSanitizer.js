const SENSITIVE_PATTERNS = [
  { pattern: /(api[Kk]ey|api[_-]?[Kk]ey|API[_-]?KEY)\s*[=:]\s*["']?([^"'\s]+)["']?/gi, replacement: "$1=***" },
  { pattern: /(secret[Kk]ey|secret[_-]?[Kk]ey|SECRET[_-]?KEY)\s*[=:]\s*["']?([^"'\s]+)["']?/gi, replacement: "$1=***" },
  { pattern: /(token|access[_-]?token|refresh[_-]?token)\s*[=:]\s*["']?([^"'\s]+)["']?/gi, replacement: "$1=***" },
  { pattern: /sk-[a-zA-Z0-9]{20,}/g, replacement: "sk-***" },
  { pattern: /pk-[a-zA-Z0-9]{20,}/g, replacement: "pk-***" },
  { pattern: /AKIA[0-9A-Z]{16}/g, replacement: "AKIA***" },
  { pattern: /[A-Za-z0-9+/]{40,}/g, replacement: "***" },
];

const SENSITIVE_FIELDS = [
  "apiKey",
  "azureApiKey",
  "token",
  "access_token",
  "refresh_token",
  "secretKey",
  "xsrfToken",
  "inviteToken",
  "formkey",
];

function sanitizeString(input) {
  if (typeof input !== "string") {
    return input;
  }
  
  let result = input;
  for (const { pattern, replacement } of SENSITIVE_PATTERNS) {
    result = result.replace(pattern, replacement);
  }
  
  return result;
}

function sanitizeObject(obj, path = "") {
  if (obj === null || typeof obj !== "object") {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map((item, index) => sanitizeObject(item, `${path}[${index}]`));
  }
  
  const sanitized = {};
  for (const key of Object.keys(obj)) {
    const newPath = path ? `${path}.${key}` : key;
    const isSensitive = SENSITIVE_FIELDS.some(
      (field) => key.toLowerCase() === field.toLowerCase()
    );
    
    if (isSensitive) {
      sanitized[key] = "***";
    } else {
      sanitized[key] = sanitizeObject(obj[key], newPath);
    }
  }
  
  return sanitized;
}

export function sanitizeLog(data) {
  if (typeof data === "string") {
    return sanitizeString(data);
  }
  
  if (data instanceof Error) {
    return {
      message: sanitizeString(data.message),
      stack: sanitizeString(data.stack),
      name: data.name,
    };
  }
  
  return sanitizeObject(data);
}

export function log(...args) {
  const sanitizedArgs = args.map((arg) => sanitizeLog(arg));
  console.log(...sanitizedArgs);
}

export function logError(...args) {
  const sanitizedArgs = args.map((arg) => sanitizeLog(arg));
  console.error(...sanitizedArgs);
}

export function logWarn(...args) {
  const sanitizedArgs = args.map((arg) => sanitizeLog(arg));
  console.warn(...sanitizedArgs);
}

export function logInfo(...args) {
  const sanitizedArgs = args.map((arg) => sanitizeLog(arg));
  console.info(...sanitizedArgs);
}

export function captureError(error, context = {}) {
  const sanitizedError = sanitizeLog(error);
  const sanitizedContext = sanitizeLog(context);
  
  console.error("Error captured:", sanitizedError, sanitizedContext);
  
  if (typeof window !== "undefined" && window.Raven) {
    window.Raven.captureException(error, {
      extra: sanitizedContext,
    });
  }
}

export function stringifySanitized(obj) {
  return JSON.stringify(sanitizeObject(obj));
}