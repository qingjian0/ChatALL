import { isElectron } from './platformDetector'

let electronShell = null

try {
  if (isElectron() && typeof window.require === 'function') {
    const { shell } = window.require('electron')
    electronShell = shell
  }
} catch (e) {
  console.warn('[Shell Adapter] Electron Shell not available')
}

const shell = {
  openExternal: async (url) => {
    if (electronShell) {
      return electronShell.openExternal(url)
    }
    window.open(url, '_blank', 'noopener,noreferrer')
    return Promise.resolve()
  },

  openPath: async (path) => {
    if (electronShell) {
      return electronShell.openPath(path)
    }
    console.warn('[Shell Adapter] openPath not supported in web')
    return Promise.resolve()
  },

  showItemInFolder: async (fullPath) => {
    if (electronShell) {
      return electronShell.showItemInFolder(fullPath)
    }
    console.warn('[Shell Adapter] showItemInFolder not supported in web')
    return Promise.resolve()
  },

  beep: () => {
    if (electronShell) {
      electronShell.beep()
      return
    }
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      gainNode.gain.value = 0.1
      oscillator.start()
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch (e) {
      console.warn('[Shell Adapter] beep not supported')
    }
  },

  writeText: async (text) => {
    if (electronShell) {
      return electronShell.writeText(text)
    }
    return navigator.clipboard.writeText(text)
  },

  readText: async () => {
    if (electronShell) {
      return electronShell.readText()
    }
    return navigator.clipboard.readText()
  }
}

export { shell }
export default shell