const PlatformType = {
  ELECTRON: "electron",
  WEB: "web",
  MOBILE: "mobile",
};

const detectPlatform = () => {
  if (typeof window !== "undefined") {
    // Check Electron environment safely
    try {
      if (window.process?.versions?.electron) {
        return PlatformType.ELECTRON;
      }
    } catch (e) {
      // Not Electron
    }
    try {
      if (typeof window.require === "function") {
        const electron = window.require("electron");
        if (electron?.ipcRenderer || electron?.remote) {
          return PlatformType.ELECTRON;
        }
      }
    } catch (e) {
      // Not Electron or Webpack build-time error
    }

    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile =
      /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent,
      );

    if (isMobile) {
      return PlatformType.MOBILE;
    }

    return PlatformType.WEB;
  }

  return PlatformType.WEB;
};

const isElectron = () => detectPlatform() === PlatformType.ELECTRON;
const isWeb = () => detectPlatform() === PlatformType.WEB;
const isMobile = () => detectPlatform() === PlatformType.MOBILE;

const platform = detectPlatform();

export { PlatformType, detectPlatform, isElectron, isWeb, isMobile, platform };
