<template>
  <div class="bots-settings">
    <h2>{{ t('settings.bots') }}</h2>
    <div class="bots-grid">
      <div
        v-for="bot in availableBots"
        :key="bot.classname"
        class="bot-card"
        :class="{ selected: isBotSelected(bot.classname) }"
        @click="toggleBot(bot.classname)"
      >
        <img :src="getBotLogo(bot.classname)" :alt="bot.model" class="bot-logo" />
        <div class="bot-info">
          <h3>{{ bot.model }}</h3>
          <p class="bot-status" :class="getBotStatusClass(bot.classname)">
            {{ getBotStatusText(bot.classname) }}
          </p>
        </div>
        <div class="bot-toggle">
          <span v-if="isBotSelected(bot.classname)">✓</span>
        </div>
      </div>
    </div>
    
    <div class="bot-configuration">
      <h3>{{ t('settings.configureBot') }}</h3>
      <BotSettingsPanel v-if="selectedBot" :bot-type="selectedBot" />
    </div>
  </div>
</template>

<script setup>import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useChatStore } from '@/stores/chatStore';
import { useBotStore } from '@/stores/botStore';
import BotSettingsPanel from '@/components/BotSettings/CommonBotSettings.vue';
const { t } = useI18n();
const chatStore = useChatStore();
const botStore = useBotStore();
const selectedBot = ref(null);
const availableBots = computed(() => {
 return botStore.bots;
});
function isBotSelected(botClassname) {
 const currentChat = chatStore.currentChat;
 if (!currentChat?.favBots)
 return false;
 return currentChat.favBots.some(bot => bot.classname === botClassname && bot.selected);
}
function toggleBot(botClassname) {
 chatStore.setBotSelected(botClassname, !isBotSelected(botClassname));
}
function getBotLogo(botClassname) {
 const bot = botStore.bots.find(b => b.classname === botClassname);
 return bot?.logo || '/bots/default-logo.svg';
}
function getBotStatusClass(botClassname) {
 const status = botStore.getBotStatus(botClassname);
 return status;
}
function getBotStatusText(botClassname) {
 const status = botStore.getBotStatus(botClassname);
 const statusMap = {
 idle: t('status.idle'),
 loading: t('status.loading'),
 ready: t('status.ready'),
 error: t('status.error'),
 };
 return statusMap[status] || status;
}
</script>

<style scoped>
.bots-settings {
  max-width: 1200px;
  margin: 0 auto;
}

.bots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.bot-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--card-bg);
  border-radius: 12px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.bot-card:hover {
  border-color: var(--primary-color);
}

.bot-card.selected {
  border-color: var(--primary-color);
  background: var(--selected-bg);
}

.bot-logo {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
}

.bot-info {
  flex: 1;
}

.bot-info h3 {
  margin: 0 0 4px 0;
  font-size: 14px;
}

.bot-status {
  margin: 0;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  display: inline-block;
}

.bot-status.idle {
  background: var(--neutral-bg);
  color: var(--text-secondary);
}

.bot-status.ready {
  background: var(--success-bg);
  color: var(--success-color);
}

.bot-status.loading {
  background: var(--warning-bg);
  color: var(--warning-color);
}

.bot-status.error {
  background: var(--error-bg);
  color: var(--error-color);
}

.bot-toggle {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.bot-card:not(.selected) .bot-toggle {
  background: var(--border-color);
}

.bot-configuration {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 24px;
}
</style>
