<template>
  <div class="appearance-settings">
    <h2>{{ t('settings.appearance') }}</h2>
    
    <div class="setting-section">
      <h3>{{ t('settings.theme') }}</h3>
      <div class="theme-options">
        <button
          v-for="theme in themes"
          :key="theme.value"
          class="theme-option"
          :class="{ active: settingsStore.settings.theme === theme.value }"
          @click="settingsStore.setTheme(theme.value)"
        >
          <div class="theme-preview" :class="theme.value"></div>
          <span>{{ t(theme.label) }}</span>
        </button>
      </div>
    </div>
    
    <div class="setting-section">
      <h3>{{ t('settings.language') }}</h3>
      <select
        v-model="selectedLang"
        @change="settingsStore.setLanguage(selectedLang)"
        class="language-select"
      >
        <option v-for="lang in languages" :key="lang.value" :value="lang.value">
          {{ lang.label }}
        </option>
      </select>
    </div>
    
    <div class="setting-section">
      <h3>{{ t('settings.columns') }}</h3>
      <div class="column-options">
        <button
          v-for="n in [1, 2, 3]"
          :key="n"
          class="column-option"
          :class="{ active: settingsStore.settings.columns === n }"
          @click="settingsStore.setColumns(n)"
        >
          {{ n }} {{ t('settings.columnsLabel') }}
        </button>
      </div>
    </div>
    
    <div class="setting-section">
      <h3>{{ t('settings.menuBar') }}</h3>
      <label class="toggle-switch">
        <input
          type="checkbox"
          :checked="settingsStore.settings.general.isShowMenuBar"
          @change="settingsStore.setGeneral({ isShowMenuBar: !settingsStore.settings.general.isShowMenuBar })"
        />
        <span class="slider"></span>
      </label>
    </div>
    
    <div class="setting-section">
      <h3>{{ t('settings.appBar') }}</h3>
      <label class="toggle-switch">
        <input
          type="checkbox"
          :checked="settingsStore.settings.general.isShowAppBar"
          @change="settingsStore.setGeneral({ isShowAppBar: !settingsStore.settings.general.isShowAppBar })"
        />
        <span class="slider"></span>
      </label>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '@/stores/settingsStore'

const { t } = useI18n()
const settingsStore = useSettingsStore()

const themes = [
  { value: 'light', label: 'settings.themeLight' },
  { value: 'dark', label: 'settings.themeDark' },
  { value: 'system', label: 'settings.themeSystem' },
]

const languages = [
  { value: 'auto', label: 'Auto' },
  { value: 'en', label: 'English' },
  { value: 'zh', label: '中文' },
  { value: 'zh-cn', label: '简体中文' },
  { value: 'zh-tw', label: '繁体中文' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
  { value: 'de', label: 'Deutsch' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
  { value: 'ru', label: 'Русский' },
  { value: 'vi', label: 'Tiếng Việt' },
]

const selectedLang = ref(settingsStore.settings.lang)

watch(() => settingsStore.settings.lang, (newLang) => {
  selectedLang.value = newLang
})
</script>

<style scoped>
.appearance-settings {
  max-width: 600px;
}

.setting-section {
  margin-bottom: 32px;
}

.setting-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
}

.theme-options {
  display: flex;
  gap: 16px;
}

.theme-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.theme-option:hover {
  border-color: var(--primary-color);
}

.theme-option.active {
  border-color: var(--primary-color);
  background: var(--selected-bg);
}

.theme-preview {
  width: 48px;
  height: 48px;
  border-radius: 8px;
}

.theme-preview.light {
  background: linear-gradient(135deg, #ffffff 50%, #f5f5f5 50%);
}

.theme-preview.dark {
  background: linear-gradient(135deg, #1a1a2e 50%, #16213e 50%);
}

.theme-preview.system {
  background: linear-gradient(135deg, #ffffff 50%, #1a1a2e 50%);
}

.language-select {
  width: 100%;
  padding: 12px 16px;
  font-size: 14px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--text-color);
  cursor: pointer;
}

.column-options {
  display: flex;
  gap: 12px;
}

.column-option {
  flex: 1;
  padding: 12px 16px;
  font-size: 14px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.2s;
}

.column-option:hover {
  border-color: var(--primary-color);
}

.column-option.active {
  border-color: var(--primary-color);
  background: var(--primary-color);
  color: white;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
  cursor: pointer;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--border-color);
  transition: 0.3s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: '';
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--primary-color);
}

input:checked + .slider:before {
  transform: translateX(26px);
}
</style>
