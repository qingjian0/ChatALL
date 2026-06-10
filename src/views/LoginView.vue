<template>
  <div class="login-view">
    <v-card>
      <v-card-title class="text-h5">Login</v-card-title>
      <v-card-text>
        <v-container>
          <v-text-field
            v-model="email"
            label="Email"
            type="email"
          />
          <v-text-field
            v-model="password"
            label="Password"
            type="password"
          />
          <v-btn color="primary" @click="login">
            Login
          </v-btn>
          <v-btn color="secondary" @click="goToHome">
            Skip
          </v-btn>
        </v-container>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const email = ref('')
const password = ref('')

function login() {
  router.push({ name: 'Home' })
}

function goToHome() {
  router.push({ name: 'Home' })
}
</script>