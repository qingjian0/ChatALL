<template>

  <div class="security-settings">
     <v-card
      > <v-card-title class="text-h5">Security Settings</v-card-title>
      <v-card-text
        > <v-container
          > <v-card-title class="text-h6">Master Password</v-card-title>
          <v-switch
            v-model="requirePassword"
            label="Require password on startup"
            @change="updateSecurityOptions"
          /> <v-divider class="my-4" /> <v-card-title class="text-h6"
            >Idle Lock</v-card-title
          > <v-switch
            v-model="lockOnIdle"
            label="Lock app when idle"
            @change="updateSecurityOptions"
          /> <v-text-field
            v-model.number="idleTimeout"
            label="Idle timeout (minutes)"
            type="number"
            :disabled="!lockOnIdle"
            @change="updateSecurityOptions"
          /> <v-divider class="my-4" /> <v-card-title class="text-h6"
            >Encryption</v-card-title
          > <v-switch
            v-model="enableEncryption"
            label="Enable data encryption"
            @change="updateSecurityOptions"
          /> <v-divider class="my-4" /> <v-card-title class="text-h6"
            >Security Level</v-card-title
          > <v-select
            v-model="securityLevel"
            :items="securityLevels"
            label="Security Level"
            @change="setSecurityLevel"
          /> <v-divider class="my-4" /> <v-btn
            color="error"
            @click="resetSecurity"
            > Reset Security Settings </v-btn
          > </v-container
        > </v-card-text
      > </v-card
    >
  </div>

</template>

<script setup>
import { ref, onMounted } from "vue";
import { useSettingsStore } from "@/stores/settingsStore";
import { useSecureStore } from "@/stores/secureStore";

const settingsStore = useSettingsStore();
const secureStore = useSecureStore();

const requirePassword = ref(false);
const lockOnIdle = ref(false);
const idleTimeout = ref(10);
const enableEncryption = ref(false);
const securityLevel = ref("medium");

const securityLevels = [
  { text: "Low", value: "low" },
  { text: "Medium", value: "medium" },
  { text: "High", value: "high" },
  { text: "Maximum", value: "maximum" },
];

onMounted(() => {
  requirePassword.value =
    settingsStore.settings.security.requirePasswordOnStartup;
  lockOnIdle.value = settingsStore.settings.security.lockOnIdle;
  idleTimeout.value = settingsStore.settings.security.idleTimeout;
  enableEncryption.value = settingsStore.settings.security.enableEncryption;
  securityLevel.value = secureStore.securityLevel;
});

function updateSecurityOptions() {
  settingsStore.setSecurityOptions({
    requirePasswordOnStartup: requirePassword.value,
    lockOnIdle: lockOnIdle.value,
    idleTimeout: idleTimeout.value,
    enableEncryption: enableEncryption.value,
  });
}

function setSecurityLevel() {
  secureStore.setSecurityLevel(securityLevel.value);
}

function resetSecurity() {
  requirePassword.value = false;
  lockOnIdle.value = false;
  idleTimeout.value = 10;
  enableEncryption.value = false;
  securityLevel.value = "medium";
  updateSecurityOptions();
  setSecurityLevel();
}
</script>
