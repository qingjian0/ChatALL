import { defineStore } from "pinia";
import { ref, computed } from "vue";
import i18n from "@/i18n";
import { secureStorage } from "@/utils/secureStorage";

export const useSettingsStore = defineStore("settings", () => {
  const settings = ref({
    lang: "auto",
    theme: "system",
    columns: 2,
    mode: "system",
    chat: {
      updateDebounceInterval: 100,
      showTimestamps: true,
      enableMarkdown: true,
      autoScroll: true,
      maxMessages: 1000,
    },
    general: {
      isShowMenuBar: true,
      isShowAppBar: true,
      confirmBeforeDelete: true,
      autoUpdate: true,
      sendOnEnter: true,
    },
    privacy: {
      enableAnalytics: false,
      enableErrorReporting: false,
      clearHistoryOnExit: false,
      historyRetentionDays: 30,
    },
    security: {
      enableEncryption: false,
      lockOnIdle: false,
      idleTimeout: 10,
      requirePasswordOnStartup: false,
    },
    advanced: {
      proxyEnabled: false,
      proxyUrl: "",
      customHeaders: {},
      requestTimeout: 60000,
      maxRetries: 3,
    },
    account: {
      displayName: "",
      email: "",
      avatar: "",
      notifications: {
        enabled: true,
        sound: true,
        desktop: false,
      },
    },
    prompts: [],
    actions: [
      {
        name: "Summarize 1",
        prefix:
          "Summarize the data below in a markdown table with the bot name, difference, and response rating (1-5) columns.\nDo not include the response value column in your table.\nSimplify the data and identify the differences.\nEach response is delimited by the `resp` tag.\nInside every response, the bot name is delimited by the `name` tag, and the bot response is delimited by the `value` tag.",
        template:
          "<resp>\n  <name>{botName}</name>\n  <value>{botResponse}</value>\n</resp>",
        suffix: "Give me the best response.",
        id: "default-summarize",
      },
    ],
  });

  const isDarkMode = computed(() => {
    if (settings.value.theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return settings.value.theme === "dark";
  });

  const hasPassword = computed(() => {
    return localStorage.getItem("chatall-has-password") === "true";
  });

  async function loadSettings() {
    try {
      const saved = localStorage.getItem("chatall-settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        settings.value = { ...settings.value, ...parsed };
      }

      if (settings.value.security.enableEncryption) {
        await loadSecureSettings();
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }

  async function loadSecureSettings() {
    try {
      const secureData = await secureStorage.getItem("settings");
      if (secureData) {
        settings.value = { ...settings.value, ...secureData };
      }
    } catch (error) {
      console.error("Failed to load secure settings:", error);
    }
  }

  async function saveSettings() {
    try {
      localStorage.setItem("chatall-settings", JSON.stringify(settings.value));

      if (settings.value.security.enableEncryption) {
        await secureStorage.setItem("settings", settings.value);
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  }

  function setLanguage(language) {
    settings.value.lang = language;
    i18n.global.locale = language;
    saveSettings();
  }

  function setTheme(theme) {
    settings.value.theme = theme;
    saveSettings();
    applyTheme();
  }

  function applyTheme() {
    const isDark = isDarkMode.value;
    document.documentElement.classList.toggle("dark", isDark);
    if (isDark) {
      document.documentElement.style.setProperty("color-scheme", "dark");
    } else {
      document.documentElement.style.removeProperty("color-scheme");
    }
  }

  function setColumns(num) {
    settings.value.columns = Math.min(Math.max(num, 1), 4);
    saveSettings();
  }

  function setMode(mode) {
    settings.value.mode = mode;
    saveSettings();
  }

  function setGeneral(options) {
    settings.value.general = { ...settings.value.general, ...options };
    saveSettings();
  }

  function setChatOptions(options) {
    settings.value.chat = { ...settings.value.chat, ...options };
    saveSettings();
  }

  function setPrivacyOptions(options) {
    settings.value.privacy = { ...settings.value.privacy, ...options };
    saveSettings();
  }

  function setSecurityOptions(options) {
    settings.value.security = { ...settings.value.security, ...options };
    saveSettings();
  }

  function setAdvancedOptions(options) {
    settings.value.advanced = { ...settings.value.advanced, ...options };
    saveSettings();
  }

  function setAccountOptions(options) {
    settings.value.account = { ...settings.value.account, ...options };
    saveSettings();
  }

  function updateAccountDisplayName(name) {
    settings.value.account.displayName = name;
    saveSettings();
  }

  function updateAccountEmail(email) {
    settings.value.account.email = email;
    saveSettings();
  }

  function updateAccountAvatar(avatar) {
    settings.value.account.avatar = avatar;
    saveSettings();
  }

  function toggleNotifications(enabled) {
    settings.value.account.notifications.enabled = enabled;
    saveSettings();
  }

  function setNotificationSound(enabled) {
    settings.value.account.notifications.sound = enabled;
    saveSettings();
  }

  function setDesktopNotifications(enabled) {
    settings.value.account.notifications.desktop = enabled;
    saveSettings();
  }

  function addPrompt(prompt) {
    settings.value.prompts.push({ ...prompt, id: Date.now().toString() });
    saveSettings();
  }

  function updatePrompt(id, updates) {
    const index = settings.value.prompts.findIndex((p) => p.id === id);
    if (index !== -1) {
      settings.value.prompts[index] = {
        ...settings.value.prompts[index],
        ...updates,
      };
      saveSettings();
    }
  }

  function deletePrompt(id) {
    const index = settings.value.prompts.findIndex((p) => p.id === id);
    if (index !== -1) {
      settings.value.prompts.splice(index, 1);
      saveSettings();
    }
  }

  function addAction(action) {
    settings.value.actions.push({ ...action, id: Date.now().toString() });
    saveSettings();
  }

  function updateAction(id, updates) {
    const index = settings.value.actions.findIndex((a) => a.id === id);
    if (index !== -1) {
      settings.value.actions[index] = {
        ...settings.value.actions[index],
        ...updates,
      };
      saveSettings();
    }
  }

  function deleteAction(id) {
    const index = settings.value.actions.findIndex((a) => a.id === id);
    if (index !== -1) {
      settings.value.actions.splice(index, 1);
      saveSettings();
    }
  }

  function updateSetting(key, value) {
    settings.value[key] = value;
    saveSettings();
  }

  async function setMasterPassword(password) {
    try {
      const success = await secureStorage.init(password);
      if (success) {
        localStorage.setItem("chatall-has-password", "true");
        settings.value.security.enableEncryption = true;
        settings.value.security.requirePasswordOnStartup = true;
        await saveSettings();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to set master password:", error);
      return false;
    }
  }

  async function verifyMasterPassword(password) {
    try {
      return await secureStorage.init(password);
    } catch (error) {
      console.error("Failed to verify master password:", error);
      return false;
    }
  }

  async function removeMasterPassword() {
    try {
      localStorage.removeItem("chatall-has-password");
      secureStorage.clearKey();
      settings.value.security.enableEncryption = false;
      settings.value.security.requirePasswordOnStartup = false;
      await saveSettings();
      return true;
    } catch (error) {
      console.error("Failed to remove master password:", error);
      return false;
    }
  }

  function resetToDefaults() {
    settings.value = {
      lang: "auto",
      theme: "system",
      columns: 2,
      mode: "system",
      chat: {
        updateDebounceInterval: 100,
        showTimestamps: true,
        enableMarkdown: true,
        autoScroll: true,
        maxMessages: 1000,
      },
      general: {
        isShowMenuBar: true,
        isShowAppBar: true,
        confirmBeforeDelete: true,
        autoUpdate: true,
        sendOnEnter: true,
      },
      privacy: {
        enableAnalytics: false,
        enableErrorReporting: false,
        clearHistoryOnExit: false,
        historyRetentionDays: 30,
      },
      security: {
        enableEncryption: false,
        lockOnIdle: false,
        idleTimeout: 10,
        requirePasswordOnStartup: false,
      },
      advanced: {
        proxyEnabled: false,
        proxyUrl: "",
        customHeaders: {},
        requestTimeout: 60000,
        maxRetries: 3,
      },
      account: {
        displayName: "",
        email: "",
        avatar: "",
        notifications: {
          enabled: true,
          sound: true,
          desktop: false,
        },
      },
      prompts: [],
      actions: [
        {
          name: "Summarize 1",
          prefix:
            "Summarize the data below in a markdown table with the bot name, difference, and response rating (1-5) columns.\nDo not include the response value column in your table.\nSimplify the data and identify the differences.\nEach response is delimited by the `resp` tag.\nInside every response, the bot name is delimited by the `name` tag, and the bot response is delimited by the `value` tag.",
          template:
            "<resp>\n  <name>{botName}</name>\n  <value>{botResponse}</value>\n</resp>",
          suffix: "Give me the best response.",
          id: "default-summarize",
        },
      ],
    };
    saveSettings();
    applyTheme();
  }

  return {
    settings,
    isDarkMode,
    hasPassword,
    loadSettings,
    saveSettings,
    setLanguage,
    setTheme,
    applyTheme,
    setColumns,
    setMode,
    setGeneral,
    setChatOptions,
    setPrivacyOptions,
    setSecurityOptions,
    setAdvancedOptions,
    setAccountOptions,
    updateAccountDisplayName,
    updateAccountEmail,
    updateAccountAvatar,
    toggleNotifications,
    setNotificationSound,
    setDesktopNotifications,
    addPrompt,
    updatePrompt,
    deletePrompt,
    addAction,
    updateAction,
    deleteAction,
    updateSetting,
    setMasterPassword,
    verifyMasterPassword,
    removeMasterPassword,
    resetToDefaults,
  };
});
