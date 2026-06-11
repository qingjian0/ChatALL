export {
  PlatformType,
  detectPlatform,
  isElectron,
  isWeb,
  isMobile,
  platform,
} from './platformDetector'

export { ipcRenderer, webEventBus } from './ipcAdapter'
export { nativeTheme, Theme, Mode, resolveTheme, applyTheme, watchSystemTheme } from './themeAdapter'
export { shell } from './shellAdapter'
export { dialog } from './dialogAdapter'
export { app, storage } from './appAdapter'

const platformAdapter = {
  PlatformType,
  platform,
  isElectron,
  isWeb,
  isMobile,
  detectPlatform,
  
  ipc: {
    renderer: ipcRenderer,
    eventBus: webEventBus,
  },
  
  theme: nativeTheme,
  shell,
  dialog,
  app,
  storage,
}

export { platformAdapter }
export default platformAdapter