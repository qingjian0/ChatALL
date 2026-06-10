import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { db } from '@/utils/database'

export const useChatStore = defineStore('chat', () => {
  const chats = ref([])
  const currentChatIndex = ref(0)
  const isChatDrawerOpen = ref(true)
  const activeBotClassnames = ref([])
  const isLoading = ref(false)

  const currentChat = computed(() => {
    return chats.value[currentChatIndex.value] || null
  })

  const activeBots = computed(() => {
    if (!currentChat.value) return []
    return currentChat.value.favBots?.filter(bot => bot.selected) || []
  })

  const sortedChats = computed(() => {
    return [...chats.value].sort((a, b) => {
      const timeA = b.selectedTime || b.modifiedTime || b.createdTime
      const timeB = a.selectedTime || a.modifiedTime || a.createdTime
      return timeA - timeB
    })
  })

  async function loadChats() {
    try {
      isLoading.value = true
      chats.value = await db.chats.toArray()
      
      if (chats.value.length === 0) {
        await addNewChat()
      }
      
      await loadActiveBots()
    } catch (error) {
      console.error('Failed to load chats:', error)
    } finally {
      isLoading.value = false
    }
  }

  async function addNewChat(favBots = []) {
    const newChat = {
      id: uuidv4(),
      title: `New Chat ${chats.value.length + 1}`,
      favBots: favBots.length > 0 ? favBots : getDefaultBots(),
      contexts: {},
      createdTime: Date.now(),
      modifiedTime: Date.now(),
      selectedTime: Date.now(),
      isTitleUserEdited: false,
    }
    
    const id = await db.chats.add(newChat)
    newChat.id = id
    chats.value.push(newChat)
    currentChatIndex.value = chats.value.length - 1
    
    return newChat
  }

  function getDefaultBots() {
    return [
      { classname: 'AzureOpenAIAPIBot', selected: false },
      { classname: 'ClaudeAPIHaikuBot', selected: false },
      { classname: 'ClaudeAPISonnetBot', selected: false },
      { classname: 'Gemini20FlashAPIBot', selected: false },
      { classname: 'Gemma29bGroqAPIBot', selected: false },
      { classname: 'Grok3APIBot', selected: false },
      { classname: 'Llama4ScoutGroqAPIBot', selected: false },
      { classname: 'OpenAIAPI41Bot', selected: false },
    ]
  }

  async function selectChat(index) {
    if (index >= 0 && index < chats.value.length) {
      currentChatIndex.value = index
      await db.chats.update(chats.value[index].id, {
        selectedTime: Date.now(),
      })
    }
  }

  async function selectChatById(chatId) {
    const index = chats.value.findIndex(c => c.id === chatId)
    if (index !== -1) {
      await selectChat(index)
    }
  }

  async function updateChatTitle(chatId, title, isEditedByUser = false) {
    const chatIndex = chats.value.findIndex(c => c.id === chatId)
    if (chatIndex !== -1) {
      const chat = chats.value[chatIndex]
      if (isEditedByUser || (!chat.isTitleUserEdited && !isEditedByUser)) {
        chats.value[chatIndex] = {
          ...chat,
          title,
          isTitleUserEdited: isEditedByUser || chat.isTitleUserEdited,
          modifiedTime: Date.now(),
        }
        await db.chats.update(chatId, chats.value[chatIndex])
      }
    }
  }

  async function deleteChat(chatId) {
    const chatIndex = chats.value.findIndex(c => c.id === chatId)
    if (chatIndex !== -1) {
      await db.chats.delete(chatId)
      await db.messages.where('chatId').equals(chatId).delete()
      await db.threads.where('chatId').equals(chatId).delete()
      
      chats.value.splice(chatIndex, 1)
      
      if (currentChatIndex.value >= chats.value.length) {
        currentChatIndex.value = Math.max(0, chats.value.length - 1)
      }
      
      await loadActiveBots()
    }
  }

  async function setBotSelected(botClassname, selected) {
    if (!currentChat.value) return false
    
    const botIndex = currentChat.value.favBots.findIndex(
      bot => bot.classname === botClassname
    )
    if (botIndex !== -1) {
      currentChat.value.favBots[botIndex].selected = selected
      await db.chats.update(currentChat.value.id, {
        favBots: currentChat.value.favBots,
        modifiedTime: Date.now(),
      })
      
      await loadActiveBots()
      return true
    }
    return false
  }

  async function loadActiveBots() {
    if (!currentChat.value) {
      activeBotClassnames.value = []
      return
    }
    activeBotClassnames.value = currentChat.value.favBots
      .filter(bot => bot.selected)
      .map(bot => bot.classname)
  }

  async function updateFavBotsOrder(newOrder) {
    if (!currentChat.value) return
    
    newOrder.forEach((botClassname, order) => {
      const bot = currentChat.value.favBots.find(
        bot => bot.classname === botClassname
      )
      if (bot) bot.order = order
    })
    
    await db.chats.update(currentChat.value.id, {
      favBots: currentChat.value.favBots,
      modifiedTime: Date.now(),
    })
  }

  async function addFavoriteBot(botClassname) {
    if (!currentChat.value) return false
    
    const exists = currentChat.value.favBots.some(
      bot => bot.classname === botClassname
    )
    if (!exists) {
      currentChat.value.favBots.push({ 
        classname: botClassname, 
        selected: true,
        order: currentChat.value.favBots.length 
      })
      await db.chats.update(currentChat.value.id, {
        favBots: currentChat.value.favBots,
        modifiedTime: Date.now(),
      })
      await loadActiveBots()
      return true
    }
    return false
  }

  async function removeFavoriteBot(botClassname) {
    if (!currentChat.value) return false
    
    const botIndex = currentChat.value.favBots.findIndex(
      bot => bot.classname === botClassname
    )
    if (botIndex !== -1) {
      currentChat.value.favBots.splice(botIndex, 1)
      await db.chats.update(currentChat.value.id, {
        favBots: currentChat.value.favBots,
        modifiedTime: Date.now(),
      })
      await loadActiveBots()
      return true
    }
    return false
  }

  async function setActiveBots(botClassnames) {
    if (!currentChat.value) return false
    
    currentChat.value.favBots.forEach(bot => {
      bot.selected = botClassnames.includes(bot.classname)
    })
    
    await db.chats.update(currentChat.value.id, {
      favBots: currentChat.value.favBots,
      modifiedTime: Date.now(),
    })
    
    await loadActiveBots()
    return true
  }

  function toggleChatDrawer() {
    isChatDrawerOpen.value = !isChatDrawerOpen.value
  }

  function setChatDrawerOpen(isOpen) {
    isChatDrawerOpen.value = isOpen
  }

  async function duplicateChat(chatId) {
    const sourceChat = chats.value.find(c => c.id === chatId)
    if (!sourceChat) return null
    
    const newChat = {
      id: uuidv4(),
      title: `${sourceChat.title} (Copy)`,
      favBots: [...sourceChat.favBots],
      contexts: { ...sourceChat.contexts },
      createdTime: Date.now(),
      modifiedTime: Date.now(),
      selectedTime: Date.now(),
      isTitleUserEdited: false,
    }
    
    const id = await db.chats.add(newChat)
    newChat.id = id
    chats.value.push(newChat)
    currentChatIndex.value = chats.value.length - 1
    
    return newChat
  }

  return {
    chats,
    currentChatIndex,
    isChatDrawerOpen,
    activeBotClassnames,
    isLoading,
    currentChat,
    activeBots,
    sortedChats,
    loadChats,
    addNewChat,
    selectChat,
    selectChatById,
    updateChatTitle,
    deleteChat,
    setBotSelected,
    updateFavBotsOrder,
    addFavoriteBot,
    removeFavoriteBot,
    setActiveBots,
    toggleChatDrawer,
    setChatDrawerOpen,
    duplicateChat,
  }
})