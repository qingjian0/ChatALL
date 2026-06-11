<template>
  <v-container class="fill-height">
    <v-layout align-center justify-center>
      <v-card class="pa-8" style="max-width: 400px;">
        <v-card-title class="text-center">
          <span class="text-h4">About ChatALL</span>
        </v-card-title>
        <v-card-text>
          <p>ChatALL is a unified chat interface that allows you to chat with all AI models in one place.</p>
          <p class="mt-4">Version: 3.0.0</p>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn color="primary" @click="goBack">
            Back
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-layout>
  </v-container>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  router.back()
}
</script>