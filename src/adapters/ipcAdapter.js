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
    return () => {
      this.listeners[channel] = this.listeners[channel].filter(h => h !== handler)
    }
  }

  emit(channel, ...args) {
    const handlers = this.listeners[channel] || []
    handlers.forEach(handler => handler(...args))
  }

  removeListener(channel, handler) {
    if (this.listeners[channel]) {
      this.listeners[channel] = this.listeners[channel].filter(h => h !== handler)
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

let electronIpcRenderer = null
const webEventBus = new WebEventBus()

try {
  if (isElectron() && typeof window.require === 'function') {
    const { ipcRenderer } = window.require('electron')
    electronIpcRenderer = ipcRenderer
  }
} catch (e) {
  console.warn('[IPC Adapter] Electron IPC not available')
}

function webInvoke(channel, ...args) {
  return new Promise(resolve => {
    webEventBus.emit(channel, ...args, resolve)
  })
}

const ipcRenderer = {
  on: electronIpcRenderer?.on?.bind(electronIpcRenderer) || webEventBus.on.bind(webEventBus),
  send: electronIpcRenderer?.send?.bind(electronIpcRenderer) || webEventBus.emit.bind(webEventBus),
  invoke: electronIpcRenderer?.invoke?.bind(electronIpcRenderer) || webInvoke,
  removeListener: electronIpcRenderer?.removeListener?.bind(electronIpcRenderer) || webEventBus.removeListener.bind(webEventBus),
  removeAllListeners: electronIpcRenderer?.removeAllListeners?.bind(electronIpcRenderer) || webEventBus.removeAllListeners.bind(webEventBus),
  emit: webEventBus.emit.bind(webEventBus),
  _platform: isElectron() ? PlatformType.ELECTRON : PlatformType.WEB
}

export { ipcRenderer, webEventBus }
export default ipcRenderer