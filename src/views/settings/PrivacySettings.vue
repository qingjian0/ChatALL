<template>
  <v-card>
    <v-card-title>{{ $t('settings.privacy') }}</v-card-title>
    <v-card-text>
      <v-switch
        v-model="telemetry"
        label="Enable telemetry"
        class="mb-4"
      />
      <v-switch
        v-model="analytics"
        label="Enable analytics"
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
import { ref } from 'vue'

const telemetry = ref(true)
const analytics = ref(true)

function saveSettings() {
  alert('Privacy settings saved')
}
</script>