<template>
  <v-card>
    <v-card-title>{{ $t('settings.bots') }}</v-card-title>
    <v-card-text>
      <v-list v-if="bots.length > 0">
        <v-list-item
          v-for="bot in bots"
          :key="bot.id"
          class="align-center justify-between"
        >
          <v-list-item-title>{{ bot.name }}</v-list-item-title>
          <v-switch
            :model-value="bot.enabled"
            @update:model-value="toggleBot(bot.id)"
          />
        </v-list-item>
      </v-list>
      <p v-else class="grey--text">No bots available.</p>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { useBotStore } from '@/stores/botStore'

const botStore = useBotStore()
const bots = computed(() => botStore.bots)

function toggleBot(botId) {
  botStore.toggleBot(botId)
}
</script>