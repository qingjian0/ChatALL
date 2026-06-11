<template>
  <v-container class="fill-height">
    <v-layout align-center justify-center>
      <v-card class="pa-8" style="max-width: 400px;">
        <v-card-title class="text-center">
          <span class="text-h4">ChatALL</span>
        </v-card-title>
        <v-card-subtitle class="text-center grey--text">
          Chat with all AI models in one place
        </v-card-subtitle>
        <v-card-text class="text-center mt-6">
          <v-btn color="primary" @click="startChat" block>
            {{ $t('chat.newChat') }}
          </v-btn>
        </v-card-text>
      </v-card>
    </v-layout>
  </v-container>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function startChat() {
  router.push('/')
}
</script>