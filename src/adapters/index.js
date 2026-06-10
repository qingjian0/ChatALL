export {
  PlatformType,
  detectPlatform,
  isElectron,
  isWeb,
  isMobile,
  platform,
} from "./platformDetector";

export { ipcRenderer, webEventBus } from "./ipcAdapter";
export { nativeTheme, getSystemTheme } from "./themeAdapter";
export { shell } from "./shellAdapter";
export { dialog } from "./dialogAdapter";
export { app, storage } from "./appAdapter";

export * from "./errorHandler";
export * from "./validator";

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
};

export { platformAdapter };
export default platformAdapter;
