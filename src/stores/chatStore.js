import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useChatStore = defineStore('chat', () => {
  const chats = ref([])
  const activeChatId = ref(null)

  const activeChat = computed(() => {
    return chats.value.find(c => c.id === activeChatId.value)
  })

  function addChat(chat) {
    const newChat = {
      id: chat.id || Date.now().toString(),
      title: chat.title || 'New Chat',
      messages: chat.messages || [],
      createdAt: chat.createdAt || Date.now(),
      updatedAt: Date.now(),
    }
    chats.value.unshift(newChat)
    activeChatId.value = newChat.id
    return newChat
  }

  function removeChat(chatId) {
    const index = chats.value.findIndex(c => c.id === chatId)
    if (index > -1) {
      chats.value.splice(index, 1)
      if (activeChatId.value === chatId) {
        activeChatId.value = chats.value[0]?.id || null
      }
    }
  }

  function addMessage(chatId, message) {
    const chat = chats.value.find(c => c.id === chatId)
    if (chat) {
      chat.messages.push({
        id: message.id || Date.now().toString(),
        content: message.content,
        role: message.role || 'user',
        timestamp: message.timestamp || Date.now(),
        botId: message.botId,
        status: message.status || 'pending',
      })
      chat.updatedAt = Date.now()
    }
  }

  function updateMessage(chatId, messageId, updates) {
    const chat = chats.value.find(c => c.id === chatId)
    if (chat) {
      const message = chat.messages.find(m => m.id === messageId)
      if (message) {
        Object.assign(message, updates)
        chat.updatedAt = Date.now()
      }
    }
  }

  function setActiveChat(chatId) {
    activeChatId.value = chatId
  }

  function updateChatTitle(chatId, title) {
    const chat = chats.value.find(c => c.id === chatId)
    if (chat) {
      chat.title = title
      chat.updatedAt = Date.now()
    }
  }

  async function loadChats() {
    try {
      const stored = localStorage.getItem('chats')
      if (stored) {
        chats.value = JSON.parse(stored)
      }
    } catch (e) {
      console.error('[Chat Store] Failed to load chats:', e)
    }
  }

  async function saveChats() {
    try {
      localStorage.setItem('chats', JSON.stringify(chats.value))
    } catch (e) {
      console.error('[Chat Store] Failed to save chats:', e)
    }
  }

  return {
    chats,
    activeChatId,
    activeChat,
    addChat,
    removeChat,
    addMessage,
    updateMessage,
    setActiveChat,
    updateChatTitle,
    loadChats,
    saveChats,
  }
})