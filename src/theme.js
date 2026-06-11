const SYSTEM = "system";
const DARK = "dark";
const LIGHT = "light";
export const Theme = { DARK, LIGHT };
export const Mode = { SYSTEM, ...Theme };

function getSystemThemeWeb() {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return Theme.DARK;
  }
  return Theme.LIGHT;
}

/**
 * Determine the actual theme for system mode
 * @param {string} mode
 * @param {object} ipcRenderer
 * @returns {string} resolved theme
 */
export const resolveTheme = async (mode, ipcRenderer) => {
  const actualMode = mode || Mode.SYSTEM;
  let resolvedTheme = actualMode;
  
  if (actualMode === Mode.SYSTEM) {
    if (ipcRenderer) {
      try {
        const nativeTheme = await ipcRenderer.invoke("get-native-theme");
        resolvedTheme = nativeTheme.shouldUseDarkColors ? Theme.DARK : Theme.LIGHT;
      } catch (error) {
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
 * @param {object} vuetifyTheme from veutify useTheme
 */
export const applyTheme = (theme, vuetifyTheme) => {
  if (vuetifyTheme) {
    vuetifyTheme.global.name.value = theme;
  }
  
  document.documentElement.setAttribute('data-theme', theme);
  if (theme === Theme.DARK) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};
