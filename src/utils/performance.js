const metrics = {
  appStart: { startTime: 0, readyTime: 0, duration: 0 },
  pageLoads: [],
  botRequests: [],
  renderTimes: [],
  memory: { samples: [], peak: 0 },
  errors: { count: 0, list: [] },
  custom: {},
}

const MAX_SAMPLES = 500
let metricsEnabled = process.env.NODE_ENV === 'development'

export function enableMetrics(enabled = true) {
  metricsEnabled = enabled
}

export function isMetricsEnabled() {
  return metricsEnabled
}

export function markAppStart() {
  if (!metricsEnabled) return
  metrics.appStart.startTime = performance.now()
}

export function markAppReady() {
  if (!metricsEnabled) return
  metrics.appStart.readyTime = performance.now()
  metrics.appStart.duration = metrics.appStart.readyTime - metrics.appStart.startTime
}

export function trackPageLoad(pageName) {
  if (!metricsEnabled) return
  const loadStart = performance.now()
  return {
    end() {
      if (!metricsEnabled) return
      metrics.pageLoads.push({
        page: pageName,
        duration: performance.now() - loadStart,
        timestamp: Date.now(),
      })
      if (metrics.pageLoads.length > MAX_SAMPLES) {
        metrics.pageLoads.shift()
      }
    }
  }
}

export function trackBotRequest(botName, requestType = 'query') {
  const startTime = performance.now()
  return {
    end(success = true, error = null) {
      if (!metricsEnabled) return
      metrics.botRequests.push({
        bot: botName,
        type: requestType,
        duration: performance.now() - startTime,
        success,
        error: error?.message || null,
        timestamp: Date.now(),
      })
      if (metrics.botRequests.length > MAX_SAMPLES) {
        metrics.botRequests.shift()
      }
    }
  }
}

export function trackRenderTime(componentName) {
  const startTime = performance.now()
  return {
    end() {
      if (!metricsEnabled) return
      metrics.renderTimes.push({
        component: componentName,
        duration: performance.now() - startTime,
        timestamp: Date.now(),
      })
      if (metrics.renderTimes.length > MAX_SAMPLES) {
        metrics.renderTimes.shift()
      }
    }
  }
}

export function getMetrics() {
  return {
    appStart: { ...metrics.appStart },
    pageLoads: [...metrics.pageLoads],
    botRequests: [...metrics.botRequests],
    renderTimes: [...metrics.renderTimes],
    memory: {
      samples: [...metrics.memory.samples],
      peak: metrics.memory.peak,
    },
    errors: { ...metrics.errors, list: [...metrics.errors.list] },
    custom: { ...metrics.custom },
  }
}

export function getMetricsSummary() {
  const avgBotRequests = calcAverage(metrics.botRequests)
  const avgRenderTimes = calcAverage(metrics.renderTimes)
  const avgPageLoads = calcAverage(metrics.pageLoads)
  const successRate = metrics.botRequests.length > 0
    ? (metrics.botRequests.filter(r => r.success).length / metrics.botRequests.length)
    : 0

  return {
    app: {
      startDuration: metrics.appStart.duration,
      pageLoads: metrics.pageLoads.length,
      errors: metrics.errors.count,
    },
    performance: {
      avgBotRequest: avgBotRequests,
      avgRender: avgRenderTimes,
      avgPageLoad: avgPageLoads,
    },
    reliability: {
      botSuccessRate: successRate,
      requestCount: metrics.botRequests.length,
    },
    memory: {
      peak: metrics.memory.peak,
      samples: metrics.memory.samples.length,
    },
    custom: { ...metrics.custom },
  }
}

function calcAverage(arr) {
  if (!arr || arr.length === 0) return 0
  return arr.reduce((sum, item) => sum + (item.duration || 0), 0) / arr.length
}

export function logMetrics() {
  if (!metricsEnabled) return
  const summary = getMetricsSummary()
  console.table && console.table({
    'App Start': `${Math.round(summary.app.startDuration)}ms`,
    'Bot Req Avg': `${Math.round(summary.performance.avgBotRequest)}ms`,
    'Render Avg': `${Math.round(summary.performance.avgRender)}ms`,
    'Success Rate': `${(summary.reliability.botSuccessRate * 100).toFixed(1)}%`,
    'Total Bot Reqs': summary.reliability.requestCount,
    'Memory Peak': summary.memory.peak ? `${summary.memory.peak.toFixed(2)}MB` : 'N/A',
    'Errors': summary.app.errors,
  })
}

export function clearMetrics() {
  metrics.pageLoads = []
  metrics.botRequests = []
  metrics.renderTimes = []
  metrics.errors = { count: 0, list: [] }
  metrics.custom = {}
}

function recordError(error) {
  metrics.errors.count++
  metrics.errors.list.push({
    message: error?.message || String(error),
    stack: error?.stack,
    timestamp: Date.now(),
  })
  if (metrics.errors.list.length > 100) {
    metrics.errors.list.shift()
  }
}

window.addEventListener('error', (e) => recordError(e.error))
window.addEventListener('unhandledrejection', (e) => recordError(e.reason))

export function sampleMemory() {
  if (!metricsEnabled || !performance.memory) return null
  const used = performance.memory.usedJSHeapSize / (1024 * 1024)
  metrics.memory.samples.push(used)
  metrics.memory.peak = Math.max(metrics.memory.peak, used)
  if (metrics.memory.samples.length > 100) {
    metrics.memory.samples.shift()
  }
  return used
}

setInterval(() => {
  if (metricsEnabled && performance.memory) {
    sampleMemory()
  }
}, 30000)

export function setCustomMetric(key, value) {
  if (!metricsEnabled) return
  metrics.custom[key] = value
}

export function incrementCustomMetric(key, delta = 1) {
  if (!metricsEnabled) return
  metrics.custom[key] = (metrics.custom[key] || 0) + delta
}
