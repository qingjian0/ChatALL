import { Theme, Mode } from './adapters/themeAdapter'

export function resolveTheme(mode) {
  const actualMode = mode || Mode.SYSTEM
  let resolvedTheme = actualMode

  if (actualMode === Mode.SYSTEM) {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      resolvedTheme = Theme.DARK
    } else {
      resolvedTheme = Theme.LIGHT
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