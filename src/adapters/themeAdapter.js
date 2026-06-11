import { isElectron, PlatformType } from './platformDetector'
import { ipcRenderer } from './ipcAdapter'

export const Theme = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
}

export const Mode = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
}

let nativeTheme = null

try {
  if (isElectron() && typeof window.require === 'function') {
    const { nativeTheme: electronNativeTheme } = window.require('electron')
    nativeTheme = electronNativeTheme
  }
} catch (e) {
  console.warn('[Theme Adapter] Electron nativeTheme not available')
}

function getSystemThemeWeb() {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return Theme.DARK
  }
  return Theme.LIGHT
}

export async function resolveTheme(mode, ipcRendererRef) {
  const actualMode = mode || Mode.SYSTEM
  let resolvedTheme = actualMode

  if (actualMode === Mode.SYSTEM) {
    if (isElectron() && ipcRendererRef) {
      try {
        const nativeThemeResult = await ipcRendererRef.invoke('get-native-theme')
        resolvedTheme = nativeThemeResult.shouldUseDarkColors ? Theme.DARK : Theme.LIGHT
      } catch (error) {
        resolvedTheme = getSystemThemeWeb()
      }
    } else {
      resolvedTheme = getSystemThemeWeb()
    }
  }

  return resolvedTheme
}

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
  if (theme === Theme.DARK) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

export function watchSystemTheme(callback) {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  
  const handler = (e) => {
    callback(e.matches ? Theme.DARK : Theme.LIGHT)
  }
  
  mediaQuery.addEventListener('change', handler)
  return () => {
    mediaQuery.removeEventListener('change', handler)
  }
}

const themeAdapter = {
  Theme,
  Mode,
  nativeTheme,
  resolveTheme,
  applyTheme,
  watchSystemTheme,
  getSystemTheme: getSystemThemeWeb,
  _platform: isElectron() ? PlatformType.ELECTRON : PlatformType.WEB
}

export { themeAdapter as nativeTheme }
export default themeAdapter