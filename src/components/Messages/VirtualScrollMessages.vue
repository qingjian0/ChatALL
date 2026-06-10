<template>
  <div
    ref="scrollContainer"
    class="virtual-scroll-container"
    @scroll="handleScroll"
    :style="{ height: containerHeight }"
  >
    <div
      class="scroll-content"
      :style="{ height: totalHeight + 'px' }"
    >
      <div
        v-for="item in visibleItems"
        :key="item.id"
        class="message-item"
        :style="{ transform: `translateY(${getItemOffset(item)}px)` }"
      >
        <chat-prompt
          v-if="item.type === 'prompt'"
          :columns="columns"
          :message="item"
        />
        <chat-response
          v-else
          :chat="chat"
          :columns="columns"
          :messages="item"
        />
      </div>
    </div>
  </div>
</template>

<script setup>import { ref, computed, onMounted, watch, nextTick } from 'vue';
import ChatPrompt from './ChatPrompt.vue';
import ChatResponse from './ChatResponse.vue';
const props = defineProps({
 columns: {
 type: Number,
 default: 3,
 },
 chat: {
 type: Object,
 },
 messages: {
 type: Array,
 default: () => [],
 },
 containerHeight: {
 type: String,
 default: '100%',
 },
});
const scrollContainer = ref(null);
const scrollTop = ref(0);
const itemHeights = ref(new Map());
const estimatedItemHeight = ref(200);
const buffer = 3;
const visibleStartIndex = computed(() => {
 const start = Math.floor(scrollTop.value / estimatedItemHeight.value) - buffer;
 return Math.max(0, start);
});
const visibleEndIndex = computed(() => {
 const containerHeightNum = parseInt(props.containerHeight) || scrollContainer.value?.clientHeight || 600;
 const end = Math.floor((scrollTop.value + containerHeightNum) / estimatedItemHeight.value) + buffer;
 return Math.min(props.messages.length, end);
});
const visibleItems = computed(() => {
 return props.messages.slice(visibleStartIndex.value, visibleEndIndex.value);
});
const totalHeight = computed(() => {
 if (itemHeights.value.size === props.messages.length) {
 let total = 0;
 props.messages.forEach((msg) => {
 total += itemHeights.value.get(msg.id) || estimatedItemHeight.value;
 });
 return total;
 }
 return props.messages.length * estimatedItemHeight.value;
});
function handleScroll() {
 if (scrollContainer.value) {
 scrollTop.value = scrollContainer.value.scrollTop;
 }
}
function getItemOffset(item) {
 let offset = 0;
 const itemIndex = props.messages.findIndex(m => m.id === item.id);
 for (let i = 0; i < itemIndex; i++) {
 offset += itemHeights.value.get(props.messages[i].id) || estimatedItemHeight.value;
 }
 return offset;
}
function measureItemHeights() {
 nextTick(() => {
 const items = scrollContainer.value?.querySelectorAll('.message-item');
 if (items) {
 items.forEach((el) => {
 const id = el.getAttribute('data-message-id');
 if (id) {
 itemHeights.value.set(id, el.offsetHeight);
 }
 });
 }
 });
}
watch(() => props.messages, () => {
 measureItemHeights();
}, { deep: true });
onMounted(() => {
 measureItemHeights();
});
</script>

<style scoped>
.virtual-scroll-container {
  overflow-y: auto;
  position: relative;
}

.scroll-content {
  position: relative;
  width: 100%;
}

.message-item {
  position: absolute;
  width: 100%;
  will-change: transform;
}
</style>