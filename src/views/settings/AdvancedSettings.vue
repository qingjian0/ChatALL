<template>

  <div class="advanced-settings">
     <v-card
      > <v-card-title class="text-h5">Advanced Settings</v-card-title>
      <v-card-text
        > <v-container
          > <v-card-title class="text-h6">Proxy Settings</v-card-title>
          <v-switch
            v-model="proxyEnabled"
            label="Enable proxy"
            @change="updateAdvancedOptions"
          /> <v-text-field
            v-model="proxyUrl"
            label="Proxy URL"
            :disabled="!proxyEnabled"
            @change="updateAdvancedOptions"
          /> <v-divider class="my-4" /> <v-card-title class="text-h6"
            >Network</v-card-title
          > <v-text-field
            v-model.number="requestTimeout"
            label="Request timeout (ms)"
            type="number"
            @change="updateAdvancedOptions"
          /> <v-text-field
            v-model.number="maxRetries"
            label="Maximum retries"
            type="number"
            @change="updateAdvancedOptions"
          /> <v-divider class="my-4" /> <v-card-title class="text-h6"
            >Reset</v-card-title
          > <v-btn color="warning" @click="resetToDefaults"
            > Reset All Settings </v-btn
          > </v-container
        > </v-card-text
      > </v-card
    >
  </div>

</template>

<script setup>
import { ref, onMounted } from "vue";
import { useSettingsStore } from "@/stores/settingsStore";

const settingsStore = useSettingsStore();

const proxyEnabled = ref(false);
const proxyUrl = ref("");
const requestTimeout = ref(60000);
const maxRetries = ref(3);

onMounted(() => {
  proxyEnabled.value = settingsStore.settings.advanced.proxyEnabled;
  proxyUrl.value = settingsStore.settings.advanced.proxyUrl;
  requestTimeout.value = settingsStore.settings.advanced.requestTimeout;
  maxRetries.value = settingsStore.settings.advanced.maxRetries;
});

function updateAdvancedOptions() {
  settingsStore.setAdvancedOptions({
    proxyEnabled: proxyEnabled.value,
    proxyUrl: proxyUrl.value,
    requestTimeout: requestTimeout.value,
    maxRetries: maxRetries.value,
  });
}

function resetToDefaults() {
  if (confirm("Are you sure you want to reset all settings to defaults?")) {
    settingsStore.resetToDefaults();
    proxyEnabled.value = false;
    proxyUrl.value = "";
    requestTimeout.value = 60000;
    maxRetries.value = 3;
  }
}
</script>
