<template>
  <div
    ref="scrollWrapper"
    class="virtual-messages-wrapper"
    @scroll="onScroll"
  >
    <div
      ref="contentContainer"
      class="content-container"
      :style="{ minHeight: totalContentHeight + 'px' }"
    >
      <div
        v-for="item in visibleItems"
        :key="item.id"
        class="message-wrapper"
        :data-message-id="item.id"
        :ref="el => setItemRef(item.id, el)"
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
    
    <div v-if="loading" class="loading-indicator">
      <span>{{ $t('chat.loading') }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import ChatPrompt from './ChatPrompt.vue'
import ChatResponse from './ChatResponse.vue'
import { throttle } from '@/utils/debounce'

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
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['load-more'])

const scrollWrapper = ref(null)
const contentContainer = ref(null)
const itemRefs = ref({})
const itemHeights = ref(new Map())
const estimatedHeight = 250
const viewportBuffer = 2
const scrollPosition = ref(0)

const averageItemHeight = computed(() => {
  if (itemHeights.value.size === 0) return estimatedHeight
  let total = 0
  itemHeights.value.forEach(h => total += h)
  return total / itemHeights.value.size || estimatedHeight
})

const visibleItems = computed(() => {
  if (!scrollWrapper.value || props.messages.length === 0) return []
  
  const clientHeight = scrollWrapper.value.clientHeight
  const startIdx = Math.max(0, Math.floor(scrollPosition.value / averageItemHeight.value) - viewportBuffer)
  const endIdx = Math.min(
    props.messages.length,
    Math.floor((scrollPosition.value + clientHeight) / averageItemHeight.value) + viewportBuffer
  )
  
  return props.messages.slice(startIdx, endIdx)
})

const totalContentHeight = computed(() => {
  if (itemHeights.value.size === props.messages.length) {
    let total = 0
    props.messages.forEach(msg => {
      total += itemHeights.value.get(msg.id) || averageItemHeight.value
    })
    return total
  }
  return props.messages.length * averageItemHeight.value
})

function setItemRef(id, el) {
  if (el) {
    itemRefs.value[id] = el
    nextTick(() => {
      if (el && el.offsetHeight > 0) {
        itemHeights.value.set(id, el.offsetHeight)
      }
    })
  }
}

const throttledScroll = throttle(() => {
  if (!scrollWrapper.value) return
  
  scrollPosition.value = scrollWrapper.value.scrollTop
  
  const scrollTop = scrollWrapper.value.scrollTop
  const scrollHeight = scrollWrapper.value.scrollHeight
  const clientHeight = scrollWrapper.value.clientHeight
  
  if (scrollHeight - scrollTop - clientHeight < 500) {
    emit('load-more')
  }
}, 16)

function onScroll() {
  throttledScroll()
}

function scrollToBottom(immediately = false) {
  nextTick(() => {
    if (scrollWrapper.value) {
      scrollWrapper.value.scrollTo({
        top: scrollWrapper.value.scrollHeight,
        behavior: immediately ? 'instant' : 'smooth'
      })
    }
  })
}

function measureHeights() {
  nextTick(() => {
    Object.entries(itemRefs.value).forEach(([id, el]) => {
      if (el && el.offsetHeight > 0 && !itemHeights.value.has(id)) {
        itemHeights.value.set(id, el.offsetHeight)
      }
    })
  })
}

watch(() => props.messages.length, () => {
  measureHeights()
})

watch(() => props.messages, () => {
  nextTick(() => {
    scrollToBottom(true)
  })
}, { deep: true })

onMounted(() => {
  measureHeights()
})

onUnmounted(() => {
  itemRefs.value = {}
  itemHeights.value.clear()
})

defineExpose({ scrollToBottom })
</script>

<style scoped>
.virtual-messages-wrapper {
  height: 100%;
  overflow-y: auto;
  position: relative;
  scroll-behavior: smooth;
}

.content-container {
  position: relative;
}

.message-wrapper {
  break-inside: avoid;
}

.loading-indicator {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.5rem 1rem;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 4px;
}
</style>