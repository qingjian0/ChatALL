<template>
   <v-container v-if="loading" class="ma-0 position-fixed" style="z-index: 1"
    > <v-label class="bg-background" style="opacity: 1">{{
      $t("chat.loading")
    }}</v-label
    > </v-container
  > <virtual-chat-messages
    ref="virtualMessagesRef"
    :columns="columns"
    :chat="chat"
    :messages="currentChatMessages"
    :loading="isLoading"
    @load-more="handleLoadMore"
  />
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useStore } from "vuex";
import { useMessageStore } from "@/stores/messageStore";
import VirtualChatMessages from "./VirtualChatMessages.vue";

const store = useStore();
const messageStore = useMessageStore();

const props = defineProps({
  columns: {
    type: Number,
    default: 3,
  },
  chat: {
    type: Object,
  },
});

const loading = ref(false);
const isLoading = computed(() => loading.value || messageStore.loading);
const virtualMessagesRef = ref(null);
const currentPage = ref(0);

const currentChatIndex = computed(() => store.state.currentChatIndex);

const currentChatMessages = computed(() => {
  return messageStore.groupedMessages;
});

async function loadMessages(chatIndex) {
  loading.value = true;
  currentPage.value = 0;
  await messageStore.loadAllMessages(chatIndex);
  loading.value = false;
}

async function handleLoadMore() {
  currentPage.value++;
  await messageStore.loadMessages(currentChatIndex.value, currentPage.value);
}

watch(
  currentChatIndex,
  async (newChat, oldChat) => {
    if (newChat !== oldChat) {
      await loadMessages(newChat);
    }
  },
  { immediate: true },
);

onMounted(async () => {
  await messageStore.loadMessages(currentChatIndex.value);

  await messageStore.loadMessages(store.state.currentChatIndex);
});
</script>

<style scoped>

</style>
