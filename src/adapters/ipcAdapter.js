import { isElectron } from './platformDetector'

class WebEventBus {
  constructor() {
    this.handlers = {}
  }

  on(channel, listener) {
    if (!this.handlers[channel]) {
      this.handlers[channel] = []
    }
    this.handlers[channel].push(listener)
    return this
  }

  off(channel, listener) {
    if (!this.handlers[channel]) return this
    this.handlers[channel] = this.handlers[channel].filter((h) => h !== listener)
    return this
  }

  send(channel, ...args) {
    const event = new CustomEvent(`ipc:${channel}`, { detail: args })
    window.dispatchEvent(event)
    return this
  }

  invoke(channel, ...args) {
    return new Promise((resolve) => {
      const responseChannel = `ipc:response:${channel}:${Date.now()}`
      const timeout = setTimeout(() => {
        this.off(responseChannel)
        resolve(null)
      }, 5000)

      const handler = (event) => {
        clearTimeout(timeout)
        this.off(responseChannel, handler)
        resolve(event.detail)
      }

      this.on(responseChannel, handler)
      this.send(channel, ...args, responseChannel)
    })
  }

  removeAllListeners(channel) {
    if (channel) {
      delete this.handlers[channel]
    } else {
      this.handlers = {}
    }
    return this
  }
}

const webEventBus = new WebEventBus()

const electronIpcRenderer = isElectron() ? window.require.electron.ipcRenderer : null

const ipcRenderer = {
  on: (channel, listener) => {
    if (electronIpcRenderer) {
      electronIpcRenderer.on(channel, listener)
    } else {
      webEventBus.on(channel, listener)
      window.addEventListener(`ipc:${channel}`, (event) => {
        listener(null, ...event.detail)
      })
    }
    return ipcRenderer
  },

  off: (channel, listener) => {
    if (electronIpcRenderer) {
      electronIpcRenderer.off(channel, listener)
    } else {
      webEventBus.off(channel, listener)
    }
    return ipcRenderer
  },

  send: (channel, ...args) => {
    if (electronIpcRenderer) {
      electronIpcRenderer.send(channel, ...args)
    } else {
      webEventBus.send(channel, ...args)
    }
    return ipcRenderer
  },

  invoke: async (channel, ...args) => {
    if (electronIpcRenderer) {
      return electronIpcRenderer.invoke(channel, ...args)
    } else {
      return webEventBus.invoke(channel, ...args)
    }
  },

  removeAllListeners: (channel) => {
    if (electronIpcRenderer) {
      electronIpcRenderer.removeAllListeners(channel)
    } else {
      webEventBus.removeAllListeners(channel)
    }
    return ipcRenderer
  },

  once: (channel, listener) => {
    if (electronIpcRenderer) {
      electronIpcRenderer.once(channel, listener)
    } else {
      const onceHandler = (...args) => {
        webEventBus.off(channel, onceHandler)
        listener(...args)
      }
      webEventBus.on(channel, onceHandler)
    }
    return ipcRenderer
  },
}

export { ipcRenderer, webEventBus }
