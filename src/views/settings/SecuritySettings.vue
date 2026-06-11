<template>
  <v-card>
    <v-card-title>{{ $t('settings.security') }}</v-card-title>
    <v-card-text>
      <v-switch
        v-model="requirePassword"
        label="Require password on startup"
        class="mb-4"
      />
      <v-switch
        v-model="encryptStorage"
        label="Encrypt storage"
        class="mb-4"
      />
      <v-text-field
        v-model="autoLockTimeout"
        label="Auto-lock timeout (minutes)"
        type="number"
        class="mb-4"
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

const requirePassword = ref(false)
const encryptStorage = ref(false)
const autoLockTimeout = ref(0)

onMounted(() => {
  requirePassword.value = settingsStore.settings.security.requirePasswordOnStartup
  encryptStorage.value = settingsStore.settings.security.encryptStorage
  autoLockTimeout.value = settingsStore.settings.security.autoLockTimeout
})

function saveSettings() {
  settingsStore.updateSetting('security.requirePasswordOnStartup', requirePassword.value)
  settingsStore.updateSetting('security.encryptStorage', encryptStorage.value)
  settingsStore.updateSetting('security.autoLockTimeout', autoLockTimeout.value)
  settingsStore.saveSettings()
}
</script>