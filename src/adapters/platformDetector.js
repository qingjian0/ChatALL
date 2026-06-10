const PlatformType = {
  ELECTRON: 'electron',
  WEB: 'web',
  MOBILE: 'mobile',
}

const detectPlatform = () => {
  if (typeof window !== 'undefined') {
    if (window.require?.electron?.ipcRenderer) {
      return PlatformType.ELECTRON
    }
    
    const userAgent = navigator.userAgent.toLowerCase()
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
    
    if (isMobile) {
      return PlatformType.MOBILE
    }
    
    return PlatformType.WEB
  }
  
  return PlatformType.WEB
}

const isElectron = () => detectPlatform() === PlatformType.ELECTRON
const isWeb = () => detectPlatform() === PlatformType.WEB
const isMobile = () => detectPlatform() === PlatformType.MOBILE

const platform = detectPlatform()

export {
  PlatformType,
  detectPlatform,
  isElectron,
  isWeb,
  isMobile,
  platform,
}
