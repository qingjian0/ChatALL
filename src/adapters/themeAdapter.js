import { isElectron } from "./platformDetector";
import { ipcRenderer } from "./ipcAdapter";

const getSystemTheme = () => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const nativeTheme = {
  shouldUseDarkColors: false,
  themeSource: "system",

  initialize: async function () {
    if (isElectron()) {
      try {
        const result = await ipcRenderer.invoke("get-native-theme");
        this.shouldUseDarkColors = result.shouldUseDarkColors || false;
      } catch (error) {
        console.warn("Failed to get native theme from Electron:", error);
        this.shouldUseDarkColors = getSystemTheme() === "dark";
      }
    } else {
      this.shouldUseDarkColors = getSystemTheme() === "dark";
    }
    return this;
  },

  on: function (event, listener) {
    if (isElectron()) {
      ipcRenderer.on("on-updated-system-theme", () => {
        ipcRenderer.invoke("get-native-theme").then((result) => {
          this.shouldUseDarkColors = result.shouldUseDarkColors || false;
          listener();
        });
      });
    } else {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", (e) => {
        this.shouldUseDarkColors = e.matches;
        listener();
      });
    }
    return this;
  },

  setThemeSource: function (source) {
    this.themeSource = source;
    if (source === "dark") {
      this.shouldUseDarkColors = true;
    } else if (source === "light") {
      this.shouldUseDarkColors = false;
    } else {
      this.shouldUseDarkColors = getSystemTheme() === "dark";
    }
    return this;
  },
};

export { nativeTheme, getSystemTheme };
