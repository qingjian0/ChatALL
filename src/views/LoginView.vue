<template>
  <v-container class="fill-height">
    <v-layout align-center justify-center>
      <v-card class="pa-8" style="max-width: 400px;">
        <v-card-title class="text-center">
          <span class="text-h4">Login</span>
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="email"
            label="Email"
            class="mt-4"
          />
          <v-text-field
            v-model="password"
            label="Password"
            type="password"
            class="mt-4"
          />
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn color="primary" @click="login">
            Login
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-layout>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')

function login() {
  router.push('/')
}
</script>