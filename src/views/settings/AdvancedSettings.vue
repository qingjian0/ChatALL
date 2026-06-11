<template>
  <v-card>
    <v-card-title>{{ $t('settings.advanced') }}</v-card-title>
    <v-card-text>
      <v-text-field
        v-model="apiTimeout"
        label="API Timeout (ms)"
        type="number"
        class="mb-4"
      />
      <v-text-field
        v-model="maxRetries"
        label="Max Retries"
        type="number"
        class="mb-4"
      />
      <v-switch
        v-model="proxyEnabled"
        label="Enable Proxy"
        class="mb-4"
      />
      <v-text-field
        v-model="proxyUrl"
        label="Proxy URL"
        :disabled="!proxyEnabled"
        class="mb-4"
      />
    </v-card-text>
    <v-card-actions>
      <v-btn color="primary" @click="saveSettings">
        {{ $t('common.save') }}
      </v-btn>
      <v-btn color="error" @click="resetSettings">
        Reset to Defaults
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settingsStore'

const settingsStore = useSettingsStore()

const apiTimeout = ref(60000)
const maxRetries = ref(3)
const proxyEnabled = ref(false)
const proxyUrl = ref('')

onMounted(() => {
  apiTimeout.value = settingsStore.settings.api.timeout
  maxRetries.value = settingsStore.settings.api.maxRetries
  proxyEnabled.value = settingsStore.settings.api.proxyEnabled
  proxyUrl.value = settingsStore.settings.api.proxyUrl
})

function saveSettings() {
  settingsStore.updateSetting('api.timeout', apiTimeout.value)
  settingsStore.updateSetting('api.maxRetries', maxRetries.value)
  settingsStore.updateSetting('api.proxyEnabled', proxyEnabled.value)
  settingsStore.updateSetting('api.proxyUrl', proxyUrl.value)
  settingsStore.saveSettings()
}

function resetSettings() {
  apiTimeout.value = 60000
  maxRetries.value = 3
  proxyEnabled.value = false
  proxyUrl.value = ''
  saveSettings()
}
</script>