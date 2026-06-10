const SYSTEM = "system";
const DARK = "dark";
const LIGHT = "light";
export const Theme = { DARK, LIGHT };
export const Mode = { SYSTEM, ...Theme };

function isElectron() {
  if (typeof window !== "undefined") {
    return !!(
      window.process?.versions?.electron ||
      (window.require && window.require.electron)
    );
  }
  return false;
}

function getSystemThemeWeb() {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? Theme.DARK
      : Theme.LIGHT;
  }
  return Theme.LIGHT;
}

/**
 * Determine the actual theme for system mode
 * @param {string} mode
 * @param {object} ipcRenderer - Optional Electron ipcRenderer (not required for web)
 * @returns {string} resolved theme
 */
export const resolveTheme = async (mode, ipcRenderer) => {
  const actualMode = mode || Mode.SYSTEM;
  let resolvedTheme = actualMode;
  if (actualMode === Mode.SYSTEM) {
    if (isElectron() && ipcRenderer) {
      try {
        const nativeTheme = await ipcRenderer.invoke("get-native-theme");
        resolvedTheme = nativeTheme.shouldUseDarkColors
          ? Theme.DARK
          : Theme.LIGHT;
      } catch (error) {
        console.warn("Failed to get native theme, using web fallback:", error);
        resolvedTheme = getSystemThemeWeb();
      }
    } else {
      resolvedTheme = getSystemThemeWeb();
    }
  }
  return resolvedTheme;
};

/**
 * Apply theme to UI
 * @param {string} theme dark / light
 * @param {object} vuetifyTheme - Optional Vuetify theme object
 */
export const applyTheme = (theme, vuetifyTheme) => {
  if (vuetifyTheme && vuetifyTheme.global && vuetifyTheme.global.name) {
    vuetifyTheme.global.name.value = theme;
  }
};
