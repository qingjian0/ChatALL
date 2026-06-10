import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/utils/database";
import { debounce } from "@/utils/debounce";
import {
  chatCache,
  cacheChatMessages,
  getCachedChatMessages,
  clearChatCache,
} from "@/utils/cache";

export const useMessageStore = defineStore("message", () => {
  const messages = ref([]);
  const threads = ref([]);
  const selectedResponses = ref([]);
  const messageQueue = ref([]);
  const loading = ref(false);
  const loadedPages = ref(new Set());
  const pageSize = 50;
  const messageStatus = ref({});
  const isTyping = ref(new Set());
  const chatId = ref(null);

  const debouncedSave = debounce(async (queue) => {
    const updates = queue.map((item) =>
      db.messages.update(item.index, item.message),
    );
    await Promise.all(updates);
    messageQueue.value = [];
  }, 100);

  const prompts = computed(() => {
    return messages.value.filter((m) => m.type === "prompt");
  });

  const responses = computed(() => {
    return messages.value.filter((m) => m.type === "response");
  });

  const groupedMessages = computed(() => {
    const grouped = [];
    let currentResponses = {};

    for (const message of messages.value) {
      if (message.type === "prompt") {
        if (Object.keys(currentResponses).length > 0) {
          grouped.push(...Object.values(currentResponses));
          currentResponses = {};
        }
        grouped.push(message);
      } else if (message.hide !== true) {
        if (!currentResponses[message.className]) {
          currentResponses[message.className] = [];
        }
        currentResponses[message.className].push(message);
      }
    }

    if (Object.keys(currentResponses).length > 0) {
      grouped.push(...Object.values(currentResponses));
    }

    return grouped;
  });

  const sortedMessages = computed(() => {
    return [...messages.value].sort((a, b) => a.createdTime - b.createdTime);
  });

  const unreadCount = computed(() => {
    return messages.value.filter(
      (m) => m.type === "response" && !m.read && m.done,
    ).length;
  });

  const pendingResponses = computed(() => {
    return messages.value.filter((m) => m.type === "response" && !m.done);
  });

  async function loadMessages(targetChatId, page = 0) {
    try {
      chatId.value = targetChatId;
      const cacheKey = `chat:${targetChatId}:page:${page}`;

      if (loadedPages.value.has(cacheKey)) {
        return;
      }

      const cached = getCachedChatMessages(targetChatId);
      if (cached && page === 0) {
        messages.value = cached;
        loadedPages.value.add(cacheKey);
        return;
      }

      loading.value = true;

      const start = page * pageSize;
      const end = start + pageSize;

      const pageMessages = await db.messages
        .where("chatId")
        .equals(targetChatId)
        .offset(start)
        .limit(pageSize)
        .sortBy("createdTime");

      if (page === 0) {
        messages.value = pageMessages;
      } else {
        messages.value = [...messages.value, ...pageMessages];
      }

      loadedPages.value.add(cacheKey);

      if (page === 0) {
        cacheChatMessages(targetChatId, messages.value);
      }

      loading.value = false;
    } catch (error) {
      console.error("Failed to load messages:", error);
      loading.value = false;
    }
  }

  async function loadAllMessages(targetChatId) {
    try {
      chatId.value = targetChatId;

      const cached = getCachedChatMessages(targetChatId);
      if (cached) {
        messages.value = cached;
        return;
      }

      loading.value = true;

      messages.value = await db.messages
        .where("chatId")
        .equals(targetChatId)
        .sortBy("createdTime");

      cacheChatMessages(targetChatId, messages.value);
      loading.value = false;
    } catch (error) {
      console.error("Failed to load messages:", error);
      loading.value = false;
    }
  }

  async function loadThreads(messageId) {
    try {
      threads.value = await db.threads
        .where("messageId")
        .equals(messageId)
        .sortBy("createdTime");
    } catch (error) {
      console.error("Failed to load threads:", error);
    }
  }

  async function addMessage(chatId, content, type = "prompt", options = {}) {
    const message = {
      id: uuidv4(),
      chatId,
      type,
      content,
      done: type === "prompt",
      format: options.format || "markdown",
      model: options.model || "",
      className: options.className || "",
      promptIndex: options.promptIndex,
      createdTime: Date.now(),
      modifiedTime: Date.now(),
      read: false,
      ...options,
    };

    const id = await db.messages.add(message);
    message.id = id;
    messages.value.push(message);
    messageStatus.value[message.id] = "pending";

    const cached = chatCache.get(`chat:${chatId}`);
    if (cached) {
      cached.messages.push(message);
      cached.timestamp = Date.now();
    }

    return message;
  }

  async function addResponseMessages(chatId, promptIndex, bots) {
    const msgs = [];

    for (const bot of bots) {
      const msg = {
        id: uuidv4(),
        chatId,
        promptIndex,
        type: "response",
        content: "",
        format: bot.getOutputFormat?.() || "markdown",
        model: bot.constructor._model || "",
        className: bot.getClassname?.() || "",
        createdTime: Date.now(),
        done: false,
        read: false,
        error: null,
      };

      await db.messages.add(msg);
      msgs.push(msg);
      messageStatus.value[msg.id] = "generating";
      isTyping.value.add(msg.className);
    }

    messages.value.push(...msgs);

    const cached = chatCache.get(`chat:${chatId}`);
    if (cached) {
      cached.messages.push(...msgs);
      cached.timestamp = Date.now();
    }

    return msgs;
  }

  async function updateMessage(id, updates) {
    const index = messages.value.findIndex((m) => m.id === id);
    if (index !== -1) {
      const chatId = messages.value[index].chatId;
      const prevDone = messages.value[index].done;

      messages.value[index] = {
        ...messages.value[index],
        ...updates,
        modifiedTime: Date.now(),
      };

      if (updates.status) {
        messageStatus.value[id] = updates.status;
      }

      if (updates.done && !prevDone) {
        messageStatus.value[id] = "completed";
        isTyping.value.delete(messages.value[index].className);
        await db.messages.update(id, messages.value[index]);
      } else if (updates.error) {
        messageStatus.value[id] = "error";
        isTyping.value.delete(messages.value[index].className);
        await db.messages.update(id, messages.value[index]);
      } else {
        messageQueue.value.push({ index: id, message: messages.value[index] });
        debouncedSave(messageQueue.value);
      }

      const cached = chatCache.get(`chat:${chatId}`);
      if (cached) {
        const cachedIndex = cached.messages.findIndex((m) => m.id === id);
        if (cachedIndex !== -1) {
          cached.messages[cachedIndex] = messages.value[index];
          cached.timestamp = Date.now();
        }
      }
    }
  }

  async function appendToMessage(id, content) {
    const index = messages.value.findIndex((m) => m.id === id);
    if (index !== -1) {
      const chatId = messages.value[index].chatId;
      messages.value[index].content += content;
      messages.value[index].modifiedTime = Date.now();

      messageQueue.value.push({ index: id, message: messages.value[index] });
      debouncedSave(messageQueue.value);

      const cached = chatCache.get(`chat:${chatId}`);
      if (cached) {
        const cachedIndex = cached.messages.findIndex((m) => m.id === id);
        if (cachedIndex !== -1) {
          cached.messages[cachedIndex].content += content;
          cached.timestamp = Date.now();
        }
      }
    }
  }

  async function addThreadMessage(chatId, messageId, content, type = "prompt") {
    const thread = {
      id: uuidv4(),
      chatId,
      messageId,
      type,
      content,
      done: type === "prompt",
      createdTime: Date.now(),
      modifiedTime: Date.now(),
      read: false,
    };

    const id = await db.threads.add(thread);
    thread.id = id;
    threads.value.push(thread);

    return thread;
  }

  async function updateThreadMessage(id, updates) {
    const index = threads.value.findIndex((t) => t.id === id);
    if (index !== -1) {
      threads.value[index] = {
        ...threads.value[index],
        ...updates,
        modifiedTime: Date.now(),
      };
      await db.threads.update(id, threads.value[index]);
    }
  }

  async function deleteMessagesByChat(chatId) {
    await db.messages.where("chatId").equals(chatId).delete();
    messages.value = messages.value.filter((m) => m.chatId !== chatId);
    chatCache.delete(`chat:${chatId}`);
    loadedPages.value.clear();
    Object.keys(messageStatus.value).forEach((key) => {
      delete messageStatus.value[key];
    });
  }

  async function deleteMessage(id) {
    const message = messages.value.find((m) => m.id === id);
    if (message) {
      await db.messages.delete(id);
      messages.value = messages.value.filter((m) => m.id !== id);

      const cached = chatCache.get(`chat:${message.chatId}`);
      if (cached) {
        cached.messages = cached.messages.filter((m) => m.id !== id);
        cached.timestamp = Date.now();
      }

      delete messageStatus.value[id];
    }
  }

  function markMessageAsRead(messageId) {
    const index = messages.value.findIndex((m) => m.id === messageId);
    if (index !== -1 && !messages.value[index].read) {
      messages.value[index].read = true;
      updateMessage(messageId, { read: true });
    }
  }

  async function markAllAsRead() {
    const unreadMessages = messages.value.filter((m) => !m.read);
    const updates = unreadMessages.map((msg) => {
      msg.read = true;
      return db.messages.update(msg.id, { read: true });
    });
    await Promise.all(updates);
  }

  function addSelectedResponse(response) {
    response.selectedIndex = selectedResponses.value.length;
    selectedResponses.value.push(response);
    return response.selectedIndex;
  }

  function removeSelectedResponse(index) {
    selectedResponses.value.splice(index, 1);
    selectedResponses.value.forEach((r, i) => {
      r.selectedIndex = i;
    });
  }

  function clearSelectedResponses() {
    selectedResponses.value = [];
  }

  function setTyping(className, isActive) {
    if (isActive) {
      isTyping.value.add(className);
    } else {
      isTyping.value.delete(className);
    }
  }

  function isBotTyping(className) {
    return isTyping.value.has(className);
  }

  function getMessageStatus(messageId) {
    return messageStatus.value[messageId] || "unknown";
  }

  async function searchMessages(chatId, query) {
    const results = await db.messages
      .where("chatId")
      .equals(chatId)
      .filter((m) => m.content.toLowerCase().includes(query.toLowerCase()))
      .toArray();
    return results;
  }

  async function exportMessages(chatId) {
    const allMessages = await db.messages
      .where("chatId")
      .equals(chatId)
      .sortBy("createdTime");

    return JSON.stringify(allMessages, null, 2);
  }

  function clearCache() {
    clearChatCache();
    loadedPages.value.clear();
    isTyping.value.clear();
    Object.keys(messageStatus.value).forEach((key) => {
      delete messageStatus.value[key];
    });
  }

  function reset() {
    messages.value = [];
    threads.value = [];
    selectedResponses.value = [];
    messageQueue.value = [];
    loading.value = false;
    loadedPages.value.clear();
    chatId.value = null;
    isTyping.value.clear();
    Object.keys(messageStatus.value).forEach((key) => {
      delete messageStatus.value[key];
    });
  }

  return {
    messages,
    threads,
    selectedResponses,
    messageStatus,
    isTyping,
    chatId,
    prompts,
    responses,
    groupedMessages,
    sortedMessages,
    unreadCount,
    pendingResponses,
    loading,
    loadedPages,
    loadMessages,
    loadAllMessages,
    loadThreads,
    addMessage,
    addResponseMessages,
    updateMessage,
    appendToMessage,
    addThreadMessage,
    updateThreadMessage,
    deleteMessagesByChat,
    deleteMessage,
    markMessageAsRead,
    markAllAsRead,
    addSelectedResponse,
    removeSelectedResponse,
    clearSelectedResponses,
    setTyping,
    isBotTyping,
    getMessageStatus,
    searchMessages,
    exportMessages,
    clearCache,
    reset,
  };
});
