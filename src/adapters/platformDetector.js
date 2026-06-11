export const PlatformType = {
  ELECTRON: 'electron',
  WEB: 'web',
  MOBILE: 'mobile'
}

let detectedPlatform = null

function detectPlatform() {
  if (detectedPlatform) return detectedPlatform
  
  try {
    if (window.process?.versions?.electron) {
      detectedPlatform = PlatformType.ELECTRON
      return detectedPlatform
    }
  } catch (e) {}
  
  try {
    if (typeof window.require === 'function') {
      try {
        const electron = window.require('electron')
        if (electron?.ipcRenderer || electron?.remote) {
          detectedPlatform = PlatformType.ELECTRON
          return detectedPlatform
        }
      } catch (e) {}
    }
  } catch (e) {}
  
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    detectedPlatform = PlatformType.MOBILE
  } else {
    detectedPlatform = PlatformType.WEB
  }
  
  return detectedPlatform
}

export function isElectron() {
  return detectPlatform() === PlatformType.ELECTRON
}

export function isWeb() {
  return detectPlatform() === PlatformType.WEB
}

export function isMobile() {
  return detectPlatform() === PlatformType.MOBILE
}

export const platform = detectPlatform()

export { detectPlatform }
export default {
  PlatformType,
  platform,
  isElectron,
  isWeb,
  isMobile,
  detectPlatform
}