import { log, logError, logWarn, logInfo, captureError, sanitizeLog } from "./logSanitizer";

const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 100;
const BRUTE_FORCE_THRESHOLD = 5;
const BRUTE_FORCE_WINDOW = 5 * 60 * 1000;

class SecurityMonitor {
  constructor() {
    this.requestHistory = new Map();
    this.failedAttempts = new Map();
    this.anomalyEvents = [];
    this.apiKeyUsage = new Map();
    this.errorCount = 0;
    this.sentryEnabled = false;
    
    this.setupMonitoring();
  }

  setupMonitoring() {
    window.addEventListener("error", (event) => {
      this.onError(event.error);
    });

    window.addEventListener("unhandledrejection", (event) => {
      this.onError(event.reason);
    });
  }

  trackRequest(requestInfo) {
    const { url, method, timestamp, statusCode, apiKeyHash } = requestInfo;
    const key = `${method}:${url}`;
    
    if (!this.requestHistory.has(key)) {
      this.requestHistory.set(key, []);
    }
    
    const history = this.requestHistory.get(key);
    history.push({ timestamp, statusCode });
    
    const windowStart = Date.now() - RATE_LIMIT_WINDOW;
    const recentRequests = history.filter((r) => r.timestamp > windowStart);
    
    if (recentRequests.length > RATE_LIMIT_MAX_REQUESTS) {
      this.reportAnomaly({
        type: "rate_limit_exceeded",
        url,
        method,
        count: recentRequests.length,
        timestamp: Date.now(),
      });
    }

    if (apiKeyHash) {
      if (!this.apiKeyUsage.has(apiKeyHash)) {
        this.apiKeyUsage.set(apiKeyHash, { count: 0, firstUsed: timestamp, lastUsed: timestamp });
      }
      const usage = this.apiKeyUsage.get(apiKeyHash);
      usage.count++;
      usage.lastUsed = timestamp;
    }
  }

  trackFailedAuth(apiKeyHash, ipAddress) {
    const now = Date.now();
    const key = apiKeyHash || ipAddress;
    
    if (!this.failedAttempts.has(key)) {
      this.failedAttempts.set(key, { count: 0, attempts: [] });
    }
    
    const attempts = this.failedAttempts.get(key);
    attempts.count++;
    attempts.attempts.push(now);
    
    const windowStart = now - BRUTE_FORCE_WINDOW;
    const recentAttempts = attempts.attempts.filter((a) => a > windowStart);
    
    if (recentAttempts.length >= BRUTE_FORCE_THRESHOLD) {
      this.reportAnomaly({
        type: "brute_force_detected",
        apiKeyHash,
        ipAddress,
        attemptCount: recentAttempts.length,
        timestamp: now,
      });
    }
  }

  reportAnomaly(anomaly) {
    const event = {
      ...anomaly,
      id: this.generateEventId(),
      severity: this.getSeverity(anomaly.type),
    };
    
    this.anomalyEvents.push(event);
    
    if (this.anomalyEvents.length > 100) {
      this.anomalyEvents.shift();
    }

    logWarn("[Security] Anomaly detected:", sanitizeLog(event));
    
    if (this.sentryEnabled && window.Sentry) {
      window.Sentry.captureMessage(`Security anomaly: ${anomaly.type}`, {
        level: event.severity,
        extra: sanitizeLog(anomaly),
      });
    }
  }

  getSeverity(type) {
    const severityMap = {
      brute_force_detected: "critical",
      rate_limit_exceeded: "warning",
      api_key_leak_suspected: "critical",
      unexpected_error: "error",
      suspicious_pattern: "warning",
    };
    return severityMap[type] || "info";
  }

  onError(error) {
    this.errorCount++;
    
    if (error.message?.toLowerCase().includes("api key") || 
        error.message?.toLowerCase().includes("signature")) {
      this.reportAnomaly({
        type: "authentication_error",
        message: error.message,
        timestamp: Date.now(),
      });
    }
    
    captureError(error);
  }

  trackUserAction(action, details = {}) {
    logInfo("[Security] User action:", action, sanitizeLog(details));
    
    if (action === "api_key_access") {
      this.checkApiKeyExposure(details);
    }
  }

  checkApiKeyExposure(details) {
    const suspiciousPatterns = [
      /sk-[a-zA-Z0-9]{20,}/g,
      /pk-[a-zA-Z0-9]{20,}/g,
      /AKIA[0-9A-Z]{16}/g,
    ];
    
    const stringified = JSON.stringify(details);
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(stringified)) {
        this.reportAnomaly({
          type: "api_key_leak_suspected",
          source: details.source || "unknown",
          timestamp: Date.now(),
        });
      }
    }
  }

  generateEventId() {
    const array = new Uint8Array(8);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => 
      byte.toString(16).padStart(2, "0")
    ).join("");
  }

  getSecurityReport() {
    const now = Date.now();
    
    return {
      timestamp: now,
      errorCount: this.errorCount,
      activeApiKeys: this.apiKeyUsage.size,
      recentAnomalies: this.anomalyEvents.slice(-10),
      requestHistorySummary: Array.from(this.requestHistory.entries()).map(([key, history]) => ({
        endpoint: key,
        requestCount: history.length,
        errorRate: history.filter((r) => r.statusCode >= 400).length / history.length,
      })),
    };
  }

  enableSentry() {
    this.sentryEnabled = true;
    logInfo("[Security] Sentry monitoring enabled");
  }

  disableSentry() {
    this.sentryEnabled = false;
    logInfo("[Security] Sentry monitoring disabled");
  }

  resetCounters() {
    this.errorCount = 0;
    this.requestHistory.clear();
    this.failedAttempts.clear();
    logInfo("[Security] Counters reset");
  }

  destroy() {
    this.requestHistory.clear();
    this.failedAttempts.clear();
    this.anomalyEvents = [];
    this.apiKeyUsage.clear();
  }
}

export const securityMonitor = new SecurityMonitor();

export default SecurityMonitor;