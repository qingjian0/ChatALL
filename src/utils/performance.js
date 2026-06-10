const performanceMetrics = {
  renderTime: 0,
  scrollTime: 0,
  memoryUsage: 0,
  domNodes: 0,
  fps: 60,
}

const frameTimes = []
let lastFrameTime = performance.now()

export function measureRenderTime(label, callback) {
  const start = performance.now()
  const result = callback()
  const end = performance.now()
  const duration = end - start
  
  console.debug(`[Performance] ${label}: ${duration.toFixed(2)}ms`)
  
  if (label === 'render') {
    performanceMetrics.renderTime = duration
  }
  
  return result
}

export function measureScrollTime(callback) {
  const start = performance.now()
  const result = callback()
  const end = performance.now()
  performanceMetrics.scrollTime = end - start
  return result
}

export function calculateFPS() {
  const currentTime = performance.now()
  const delta = currentTime - lastFrameTime
  lastFrameTime = currentTime
  
  frameTimes.push(delta)
  if (frameTimes.length > 60) {
    frameTimes.shift()
  }
  
  const avgDelta = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length
  performanceMetrics.fps = Math.round(1000 / avgDelta)
  
  return performanceMetrics.fps
}

export function updateMemoryUsage() {
  if (window.performance && window.performance.memory) {
    const memory = window.performance.memory
    performanceMetrics.memoryUsage = (memory.usedJSHeapSize / 1024 / 1024).toFixed(2)
  }
}

export function updateDomNodeCount() {
  performanceMetrics.domNodes = document.querySelectorAll('*').length
}

export function getPerformanceMetrics() {
  return { ...performanceMetrics }
}

export function logPerformanceReport() {
  console.table({
    'Render Time (ms)': performanceMetrics.renderTime.toFixed(2),
    'Scroll Time (ms)': performanceMetrics.scrollTime.toFixed(2),
    'Memory Usage (MB)': performanceMetrics.memoryUsage,
    'DOM Nodes': performanceMetrics.domNodes,
    'FPS': performanceMetrics.fps,
  })
}

export function shouldOptimize() {
  return performanceMetrics.fps < 30 || performanceMetrics.domNodes > 5000
}

export function debounceAnimationFrame(fn) {
  let requestId = null
  return function(...args) {
    if (requestId) {
      cancelAnimationFrame(requestId)
    }
    requestId = requestAnimationFrame(() => {
      fn.apply(this, args)
      requestId = null
    })
  }
}

export function throttleAnimationFrame(fn, limit = 16) {
  let inThrottle = false
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args)
      inThrottle = true
      requestAnimationFrame(() => {
        inThrottle = false
      })
    }
  }
}

export class PerformanceObserverWrapper {
  constructor() {
    this.observer = null
    this.entries = []
  }
  
  start() {
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        this.entries = this.entries.concat(list.getEntries())
      })
      this.observer.observe({ entryTypes: ['measure', 'render'] })
    }
  }
  
  stop() {
    if (this.observer) {
      this.observer.disconnect()
    }
  }
  
  getEntriesByType(type) {
    return this.entries.filter(e => e.entryType === type)
  }
}

setInterval(() => {
  calculateFPS()
  updateMemoryUsage()
  updateDomNodeCount()
}, 1000)