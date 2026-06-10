<template>
   <v-app
    > <router-view v-slot="{ Component }"
      > <transition name="fade" mode="out-in"
        > <component :is="Component" /> </transition
      > </router-view
    > </v-app
  >
</template>

<script setup>
import { onMounted, onUnmounted } from "vue";
import { useSettingsStore } from "@/stores/settingsStore";
import { useChatStore } from "@/stores/chatStore";
import { useBotStore } from "@/stores/botStore";

const settingsStore = useSettingsStore();
const chatStore = useChatStore();
const botStore = useBotStore();

async function initApp() {
  settingsStore.loadSettings();
  await chatStore.loadChats();
  await botStore.loadBotConfigs();
  await botStore.initBots();
}

function handleBeforeUnload() {
  settingsStore.saveSettings();
}

onMounted(() => {
  initApp();
  window.addEventListener("beforeunload", handleBeforeUnload);
});

onUnmounted(() => {
  window.removeEventListener("beforeunload", handleBeforeUnload);
});
</script>

<style>
@import 'katex/dist/katex.min.css';

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
}

#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

:root {
  --sidebar-bg: #f5f5f5;
  --card-bg: #ffffff;
  --border-color: #e0e0e0;
  --text-color: #212121;
  --text-secondary: #757575;
  --primary-color: #062AAA;
  --hover-bg: #eeeeee;
  --active-bg: #e3f2fd;
  --selected-bg: #e3f2fd;
  --success-bg: #e8f5e9;
  --success-color: #2e7d32;
  --warning-bg: #fff3e0;
  --warning-color: #e65100;
  --error-bg: #ffebee;
  --error-color: #c62828;
  --neutral-bg: #f5f5f5;
}

@media (prefers-color-scheme: dark) {
  :root {
    --sidebar-bg: #292a2d;
    --card-bg: #1a1a20;
    --border-color: #3d3d3d;
    --text-color: #ffffff;
    --text-secondary: #b0b0b0;
    --primary-color: #ececf1;
    --hover-bg: #3d3d3d;
    --active-bg: #424242;
    --selected-bg: #424242;
    --success-bg: #1b5e20;
    --success-color: #81c784;
    --warning-bg: #e65100;
    --warning-color: #ffcc80;
    --error-bg: #c62828;
    --error-color: #ffcdd2;
    --neutral-bg: #3d3d3d;
  }
}
</style>

