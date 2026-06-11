import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useBotStore = defineStore('bot', () => {
  const bots = ref([])
  const botConfigs = ref({})
  const initialized = ref(false)

  const activeBots = computed(() => {
    return bots.value.filter(b => b.enabled)
  })

  const availableBots = computed(() => {
    return bots.value.filter(b => b.available)
  })

  function addBot(bot) {
    const existing = bots.value.find(b => b.id === bot.id)
    if (existing) {
      Object.assign(existing, bot)
    } else {
      bots.value.push(bot)
    }
  }

  function removeBot(botId) {
    const index = bots.value.findIndex(b => b.id === botId)
    if (index > -1) {
      bots.value.splice(index, 1)
    }
  }

  function updateBotConfig(botId, config) {
    botConfigs.value[botId] = { ...botConfigs.value[botId], ...config }
  }

  function getBotConfig(botId) {
    return botConfigs.value[botId] || {}
  }

  function toggleBot(botId) {
    const bot = bots.value.find(b => b.id === botId)
    if (bot) {
      bot.enabled = !bot.enabled
    }
  }

  async function initBots() {
    try {
      const botModules = await import('@/bots/index.js')
      const botClasses = Object.values(botModules.default || botModules)
      
      for (const BotClass of botClasses) {
        if (typeof BotClass === 'function') {
          const bot = new BotClass()
          const config = botConfigs.value[bot.id] || {}
          bot.enabled = config.enabled !== undefined ? config.enabled : true
          bot.available = true
          addBot(bot)
        }
      }
      initialized.value = true
    } catch (e) {
      console.error('[Bot Store] Failed to init bots:', e)
    }
  }

  async function loadBotConfigs() {
    try {
      const stored = localStorage.getItem('botConfigs')
      if (stored) {
        botConfigs.value = JSON.parse(stored)
      }
    } catch (e) {
      console.error('[Bot Store] Failed to load bot configs:', e)
    }
  }

  async function saveBotConfigs() {
    try {
      localStorage.setItem('botConfigs', JSON.stringify(botConfigs.value))
    } catch (e) {
      console.error('[Bot Store] Failed to save bot configs:', e)
    }
  }

  return {
    bots,
    botConfigs,
    initialized,
    activeBots,
    availableBots,
    addBot,
    removeBot,
    updateBotConfig,
    getBotConfig,
    toggleBot,
    initBots,
    loadBotConfigs,
    saveBotConfigs,
  }
})