<template>
  <v-container class="fill-height">
    <v-layout align-center justify-center>
      <v-card class="pa-8" style="max-width: 600px;">
        <v-card-title class="text-center">
          <span class="text-h4">ChatALL Web Access</span>
        </v-card-title>
        <v-card-subtitle class="text-center grey--text">
          Chat with all AI models in one place
        </v-card-subtitle>
        
        <v-card-text class="mt-6">
          <v-btn color="primary" @click="newChat" block class="mb-4">
            {{ $t('chat.newChat') }}
          </v-btn>
          
          <v-list v-if="chats.length > 0">
            <v-list-item
              v-for="chat in chats"
              :key="chat.id"
              @click="openChat(chat.id)"
              class="cursor-pointer"
            >
              <v-list-item-title>{{ chat.title }}</v-list-item-title>
              <v-list-item-subtitle>{{ formatTime(chat.updatedAt) }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
          
          <p v-else class="text-center grey--text mt-4">No chats yet. Click "New Chat" to start.</p>
        </v-card-text>
        
        <v-card-actions class="justify-center">
          <v-btn text @click="goToSettings">
            Settings
          </v-btn>
          <v-btn text @click="goToAbout">
            About
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-layout>
  </v-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chatStore'

const router = useRouter()
const chatStore = useChatStore()

const chats = computed(() => chatStore.chats)

function newChat() {
  const chat = chatStore.addChat({ title: 'New Chat' })
  router.push(`/chat/${chat.id}`)
}

function openChat(chatId) {
  router.push(`/chat/${chatId}`)
}

function goToSettings() {
  router.push('/settings')
}

function goToAbout() {
  router.push('/about')
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleString()
}
</script>