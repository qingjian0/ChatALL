<template>
  <div class="account-settings">
    <v-card>
      <v-card-title class="text-h5">Account Settings</v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="displayName"
                label="Display Name"
                @change="updateDisplayName"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="email"
                label="Email Address"
                type="email"
                @change="updateEmail"
              />
            </v-col>
          </v-row>
          
          <v-divider class="my-4" />
          
          <v-card-title class="text-h6">Notifications</v-card-title>
          <v-switch
            v-model="notificationsEnabled"
            label="Enable Notifications"
            @change="toggleNotifications"
          />
          <v-switch
            v-model="notificationSound"
            label="Play Sound"
            :disabled="!notificationsEnabled"
            @change="setNotificationSound"
          />
          <v-switch
            v-model="desktopNotifications"
            label="Desktop Notifications"
            :disabled="!notificationsEnabled"
            @change="setDesktopNotifications"
          />
        </v-container>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settingsStore'

const settingsStore = useSettingsStore()

const displayName = ref('')
const email = ref('')
const notificationsEnabled = ref(false)
const notificationSound = ref(false)
const desktopNotifications = ref(false)

onMounted(() => {
  displayName.value = settingsStore.settings.account.displayName
  email.value = settingsStore.settings.account.email
  notificationsEnabled.value = settingsStore.settings.account.notifications.enabled
  notificationSound.value = settingsStore.settings.account.notifications.sound
  desktopNotifications.value = settingsStore.settings.account.notifications.desktop
})

function updateDisplayName() {
  settingsStore.updateAccountDisplayName(displayName.value)
}

function updateEmail() {
  settingsStore.updateAccountEmail(email.value)
}

function toggleNotifications() {
  settingsStore.toggleNotifications(notificationsEnabled.value)
}

function setNotificationSound() {
  settingsStore.setNotificationSound(notificationSound.value)
}

function setDesktopNotifications() {
  settingsStore.setDesktopNotifications(desktopNotifications.value)
}
</script>