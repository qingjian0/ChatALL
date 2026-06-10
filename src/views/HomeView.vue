<template>
  <div class="home-view">
    <ChatDrawer />
    <main class="chat-content">
      <ChatThread />
    </main>
  </div>
</template>

<script setup>
import ChatDrawer from '@/components/ChatDrawer/ChatDrawer.vue'
import ChatThread from '@/components/Messages/ChatThread.vue'
</script>

<style scoped>
.home-view {
  display: flex;
  height: 100vh;
}

.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
