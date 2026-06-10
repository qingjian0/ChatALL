const SENSITIVE_KEYS = [
  "apiKey",
  "api_key",
  "apikey",
  "token",
  "accessToken",
  "access_token",
  "refreshToken",
  "refresh_token",
  "secretKey",
  "secret_key",
  "secret",
  "password",
  "pwd",
  "authorization",
  "auth",
  "cookie",
  "cookies",
  "privateKey",
  "private_key",
  "sessionId",
  "session_id",
  "clientSecret",
  "client_secret",
  "credentials",
  "credential",
];

const SENSITIVE_PATTERNS = [
  { regex: /sk-[a-zA-Z0-9]{20,}/gi, replacement: "sk-***REDACTED***" },
  {
    regex: /Bearer\s+[a-zA-Z0-9\-_\.]{10,}/gi,
    replacement: "Bearer ***REDACTED***",
  },
  {
    regex: /eyJ[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+/g,
    replacement: "***JWT_REDACTED***",
  },
  {
    regex: /password["'\s]*[:=]["']?[^"'\s&]+/gi,
    replacement: 'password":"***REDACTED***"',
  },
];

export function redactValue(value, key) {
  if (value == null) return value;

  const normalizedKey = String(key || "").toLowerCase();
  const isSensitive = SENSITIVE_KEYS.some((sensitiveKey) =>
    normalizedKey.includes(sensitiveKey),
  );

  if (isSensitive) {
    if (typeof value === "string") {
      return maskString(value);
    }
    if (typeof value === "number" || typeof value === "boolean") {
      return "***";
    }
    if (typeof value === "object") {
      return "[REDACTED OBJECT]";
    }
  }

  if (typeof value === "string") {
    return redactPatterns(value);
  }

  return value;
}

function maskString(str) {
  if (!str || str.length <= 4) return "****";
  const visibleStart = Math.min(2, Math.floor(str.length / 4));
  const visibleEnd = Math.min(2, Math.floor(str.length / 4));
  return (
    str.slice(0, visibleStart) +
    "*".repeat(Math.max(4, str.length - visibleStart - visibleEnd)) +
    str.slice(-visibleEnd)
  );
}

function redactPatterns(str) {
  let result = str;
  for (const { regex, replacement } of SENSITIVE_PATTERNS) {
    result = result.replace(regex, replacement);
  }
  return result;
}

export function redactObject(obj, depth = 0) {
  if (depth > 10) return "[MAX DEPTH]";

  if (obj == null) return obj;
  if (typeof obj !== "object") return redactValue(obj);

  if (Array.isArray(obj)) {
    return obj.map((item) => redactObject(item, depth + 1));
  }

  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = redactValue(value, key);
    if (
      typeof value === "object" &&
      value !== null &&
      !ArrayBuffer.isView(value)
    ) {
      result[key] = redactObject(value, depth + 1);
    }
  }
  return result;
}

export function safeLog(...args) {
  const redacted = args.map((arg) => {
    if (arg == null) return arg;
    if (typeof arg === "string") return redactPatterns(arg);
    if (typeof arg === "object") return redactObject(arg);
    return arg;
  });
  return redacted;
}

export function createSafeLogger(prefix = "") {
  return {
    log: (...args) => console.log(prefix, ...safeLog(...args)),
    warn: (...args) => console.warn(prefix, ...safeLog(...args)),
    error: (...args) => console.error(prefix, ...safeLog(...args)),
    debug: (...args) => {
      if (process.env.NODE_ENV !== "production") {
        console.debug(prefix, ...safeLog(...args));
      }
    },
  };
}

export function maskApiKey(apiKey) {
  if (!apiKey || typeof apiKey !== "string") return "";
  if (apiKey.length <= 8) return "*".repeat(apiKey.length);
  return (
    apiKey.slice(0, 4) +
    "*".repeat(Math.max(8, apiKey.length - 8)) +
    apiKey.slice(-4)
  );
}

export function maskPhone(phone) {
  if (!phone || typeof phone !== "string") return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length <= 7) return "*".repeat(digits.length);
  return digits.slice(0, 3) + "*".repeat(digits.length - 7) + digits.slice(-4);
}

export function maskEmail(email) {
  if (!email || typeof email !== "string") return "";
  const [username, domain] = email.split("@");
  if (!username || !domain) return email;
  if (username.length <= 2) return "*".repeat(username.length) + "@" + domain;
  return (
    username[0] +
    "*".repeat(Math.max(3, username.length - 2)) +
    username.slice(-1) +
    "@" +
    domain
  );
}

export default {
  redactValue,
  redactObject,
  safeLog,
  createSafeLogger,
  maskApiKey,
  maskPhone,
  maskEmail,
};
