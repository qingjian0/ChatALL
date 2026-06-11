import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref({
    appearance: {
      theme: 'system',
      fontSize: 'medium',
      compactMode: false,
    },
    chat: {
      autoScroll: true,
      showTimestamps: true,
      enableMarkdown: true,
      showAvatar: true,
    },
    security: {
      requirePasswordOnStartup: false,
      autoLockTimeout: 0,
      encryptStorage: false,
    },
    notifications: {
      enabled: true,
      soundEnabled: true,
      popupEnabled: true,
    },
    language: 'zh-CN',
    api: {
      timeout: 60000,
      maxRetries: 3,
      proxyEnabled: false,
      proxyUrl: '',
    },
  })

  const theme = computed(() => settings.value.appearance.theme)
  const language = computed(() => settings.value.language)

  function updateSetting(path, value) {
    const keys = path.split('.')
    let current = settings.value
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]]
    }
    current[keys[keys.length - 1]] = value
  }

  function setTheme(theme) {
    settings.value.appearance.theme = theme
  }

  function setLanguage(language) {
    settings.value.language = language
  }

  async function loadSettings() {
    try {
      const stored = localStorage.getItem('settings')
      if (stored) {
        const saved = JSON.parse(stored)
        settings.value = { ...settings.value, ...saved }
      }
    } catch (e) {
      console.error('[Settings Store] Failed to load settings:', e)
    }
  }

  async function saveSettings() {
    try {
      localStorage.setItem('settings', JSON.stringify(settings.value))
    } catch (e) {
      console.error('[Settings Store] Failed to save settings:', e)
    }
  }

  return {
    settings,
    theme,
    language,
    updateSetting,
    setTheme,
    setLanguage,
    loadSettings,
    saveSettings,
  }
})