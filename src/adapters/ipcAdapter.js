import { isElectron, PlatformType } from './platformDetector'

class WebEventBus {
  constructor() {
    this.listeners = {}
  }

  on(channel, handler) {
    if (!this.listeners[channel]) {
      this.listeners[channel] = []
    }
    this.listeners[channel].push(handler)
    var self = this
    return function() {
      self.listeners[channel] = self.listeners[channel].filter(function(h) { return h !== handler })
    }
  }

  emit(channel) {
    var args = Array.prototype.slice.call(arguments, 1)
    var handlers = this.listeners[channel] || []
    handlers.forEach(function(handler) { handler.apply(null, args) })
  }

  removeListener(channel, handler) {
    if (this.listeners[channel]) {
      this.listeners[channel] = this.listeners[channel].filter(function(h) { return h !== handler })
    }
  }

  removeAllListeners(channel) {
    if (channel) {
      delete this.listeners[channel]
    } else {
      this.listeners = {}
    }
  }
}

var electronIpcRenderer = null
var webEventBus = new WebEventBus()

try {
  if (isElectron() && typeof window.require === 'function') {
    var modules = window.require('electron')
    electronIpcRenderer = modules.ipcRenderer
  }
} catch (e) {
  console.warn('[IPC Adapter] Electron IPC not available')
}

function webInvoke(channel) {
  var args = Array.prototype.slice.call(arguments, 1)
  return new Promise(function(resolve) {
    webEventBus.emit.apply(webEventBus, [channel].concat(args).concat([resolve]))
  })
}

function getOn() {
  if (electronIpcRenderer && electronIpcRenderer.on) {
    return electronIpcRenderer.on.bind(electronIpcRenderer)
  }
  return webEventBus.on.bind(webEventBus)
}

function getSend() {
  if (electronIpcRenderer && electronIpcRenderer.send) {
    return electronIpcRenderer.send.bind(electronIpcRenderer)
  }
  return webEventBus.emit.bind(webEventBus)
}

function getInvoke() {
  if (electronIpcRenderer && electronIpcRenderer.invoke) {
    return electronIpcRenderer.invoke.bind(electronIpcRenderer)
  }
  return webInvoke
}

function getRemoveListener() {
  if (electronIpcRenderer && electronIpcRenderer.removeListener) {
    return electronIpcRenderer.removeListener.bind(electronIpcRenderer)
  }
  return webEventBus.removeListener.bind(webEventBus)
}

function getRemoveAllListeners() {
  if (electronIpcRenderer && electronIpcRenderer.removeAllListeners) {
    return electronIpcRenderer.removeAllListeners.bind(electronIpcRenderer)
  }
  return webEventBus.removeAllListeners.bind(webEventBus)
}

var ipcRenderer = {
  on: getOn(),
  send: getSend(),
  invoke: getInvoke(),
  removeListener: getRemoveListener(),
  removeAllListeners: getRemoveAllListeners(),
  emit: webEventBus.emit.bind(webEventBus),
  _platform: isElectron() ? PlatformType.ELECTRON : PlatformType.WEB
}

export { ipcRenderer, webEventBus }
export default ipcRenderer
