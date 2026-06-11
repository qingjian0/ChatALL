<template>
  <v-container class="fill-height">
    <v-layout align-center justify-center>
      <v-card class="pa-8" style="max-width: 400px;">
        <v-card-title class="text-center">
          <span class="text-h4">404 - Page Not Found</span>
        </v-card-title>
        <v-card-text class="text-center">
          <p class="grey--text">The page you are looking for does not exist.</p>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn color="primary" @click="goHome">
            Go Home
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-layout>
  </v-container>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>