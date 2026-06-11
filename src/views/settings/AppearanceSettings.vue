<template>
  <v-card>
    <v-card-title>{{ $t('settings.appearance') }}</v-card-title>
    <v-card-text>
      <v-select
        v-model="theme"
        :items="themeOptions"
        label="Theme"
        class="mb-4"
      />
      <v-switch
        v-model="compactMode"
        label="Compact Mode"
        class="mb-4"
      />
      <v-select
        v-model="fontSize"
        :items="fontSizeOptions"
        label="Font Size"
      />
    </v-card-text>
    <v-card-actions>
      <v-btn color="primary" @click="saveSettings">
        {{ $t('common.save') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settingsStore'

const settingsStore = useSettingsStore()

const theme = ref('system')
const compactMode = ref(false)
const fontSize = ref('medium')

const themeOptions = [
  { text: 'Light', value: 'light' },
  { text: 'Dark', value: 'dark' },
  { text: 'System', value: 'system' },
]

const fontSizeOptions = [
  { text: 'Small', value: 'small' },
  { text: 'Medium', value: 'medium' },
  { text: 'Large', value: 'large' },
]

onMounted(() => {
  theme.value = settingsStore.settings.appearance.theme
  compactMode.value = settingsStore.settings.appearance.compactMode
  fontSize.value = settingsStore.settings.appearance.fontSize
})

function saveSettings() {
  settingsStore.updateSetting('appearance.theme', theme.value)
  settingsStore.updateSetting('appearance.compactMode', compactMode.value)
  settingsStore.updateSetting('appearance.fontSize', fontSize.value)
  settingsStore.saveSettings()
}
</script>