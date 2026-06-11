<template>
  <v-container class="fill-height">
    <v-layout align-center justify-center>
      <v-card class="pa-8" style="max-width: 400px;">
        <v-card-title class="text-center">
          <span class="text-h4">Enter Password</span>
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="password"
            label="Password"
            type="password"
            @keyup.enter="unlock"
            class="mt-4"
          />
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn color="primary" @click="unlock">
            Unlock
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-layout>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSecureStore } from '@/stores/secureStore'

const router = useRouter()
const secureStore = useSecureStore()
const password = ref('')

async function unlock() {
  const success = await secureStore.authenticate(password.value)
  if (success) {
    router.push('/')
  } else {
    alert('Invalid password')
  }
}
</script>