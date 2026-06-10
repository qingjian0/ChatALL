import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { secureStorage } from "@/utils/secureStorage";

export const useBotStore = defineStore("bot", () => {
  const bots = ref([]);
  const activeBots = ref([]);
  const botConfigs = ref({});
  const botStatus = ref({});
  const botInstances = ref({});
  const isInitialized = ref(false);
  const initializationError = ref(null);

  const availableBots = computed(() => {
    return bots.value.map((bot) => ({
      class: bot.class,
      classname: bot.classname,
      model: bot.model,
      logo: bot.logo,
      isAvailable: bot.class.isAvailable?.() !== false,
    }));
  });

  const onlineBots = computed(() => {
    return activeBots.value.filter((bot) => {
      const status = botStatus.value[bot.classname];
      return status === "online" || status === "connected";
    });
  });

  const offlineBots = computed(() => {
    return activeBots.value.filter((bot) => {
      const status = botStatus.value[bot.classname];
      return (
        status === "offline" || status === "disconnected" || status === "error"
      );
    });
  });

  const loadingBots = computed(() => {
    return activeBots.value.filter((bot) => {
      const status = botStatus.value[bot.classname];
      return status === "loading" || status === "connecting";
    });
  });

  async function loadBotConfigs() {
    try {
      const encrypted = localStorage.getItem("chatall-bot-configs");
      if (encrypted) {
        botConfigs.value = await secureStorage.decrypt(encrypted);
      } else {
        botConfigs.value = getDefaultBotConfigs();
      }
    } catch (error) {
      console.error("Failed to load bot configs:", error);
      botConfigs.value = getDefaultBotConfigs();
    }
  }

  function getDefaultBotConfigs() {
    return {
      geminiApi: {
        apiKey: "",
        temperature: 0.7,
        pastRounds: 5,
        topK: 16,
        topP: 0.95,
      },
      claudeApi: { apiKey: "", temperature: 0, alterUrl: "", maxTokens: 1000 },
      cohereApi: { apiKey: "", temperature: 0.8, pastRounds: 5 },
      openaiApi: { apiKey: "", temperature: 1, pastRounds: 5, alterUrl: "" },
      azureOpenaiApi: {
        apiKey: "",
        temperature: 1,
        pastRounds: 5,
        instanceName: "",
        deploymentName: "",
        apiVersion: "",
      },
      groqApi: { apiKey: "", temperature: 0, maxTokens: 1000, pastRounds: 1 },
      mistral: { model: "mistral-large" },
      kimi: { accessToken: "", refreshToken: "" },
      doubao: {
        apiKey: "",
        modelId: "",
        baseUrl: "",
        temperature: 0.7,
        pastRounds: 5,
      },
      deepseek: {
        apiKey: "",
        modelId: "deepseek-chat",
        baseUrl: "",
        temperature: 0.7,
        pastRounds: 5,
      },
      chatglmApi: {
        apiKey: "",
        modelId: "glm-4",
        baseUrl: "",
        temperature: 0.7,
        pastRounds: 5,
      },
      qwenApi: {
        apiKey: "",
        modelId: "qwen-plus",
        baseUrl: "",
        temperature: 0.7,
        pastRounds: 5,
      },
      sparkApi: {
        apiKey: "",
        modelId: "generalv3.5",
        baseUrl: "",
        temperature: 0.7,
        pastRounds: 5,
      },
      miniMaxApi: {
        apiKey: "",
        modelId: "abab6.5s-chat",
        baseUrl: "",
        temperature: 0.7,
        pastRounds: 5,
      },
      wenxinQianfan: { apiKey: "", secretKey: "", pastRounds: 5 },
      xaiApi: { apiKey: "", pastRounds: 5 },
      gradio: { url: "", fnIndex: 0 },
      perplexity: { version: "2.5" },
      phind: { model: "Phind Model" },
    };
  }

  async function saveBotConfigs() {
    try {
      const encrypted = await secureStorage.encrypt(botConfigs.value);
      localStorage.setItem("chatall-bot-configs", encrypted);
    } catch (error) {
      console.error("Failed to save bot configs:", error);
    }
  }

  function updateBotConfig(botType, config) {
    if (!botConfigs.value[botType]) {
      botConfigs.value[botType] = {};
    }
    botConfigs.value[botType] = { ...botConfigs.value[botType], ...config };
    saveBotConfigs();
  }

  function getBotConfig(botType) {
    return botConfigs.value[botType] || {};
  }

  function getApiKey(botType) {
    const config = botConfigs.value[botType];
    return (
      config?.apiKey ||
      config?.accessToken ||
      config?.token ||
      config?.secretKey ||
      ""
    );
  }

  function setBotStatus(botClassname, status) {
    botStatus.value[botClassname] = status;
  }

  function getBotStatus(botClassname) {
    return botStatus.value[botClassname] || "idle";
  }

  async function initBots() {
    try {
      initializationError.value = null;
      const botModules = import.meta.glob("../bots/**/*.js");
      const botList = [];

      for (const [path, module] of Object.entries(botModules)) {
        try {
          const botModule = await module();
          const botClass = botModule.default;
          if (botClass && botClass._model) {
            botList.push({
              class: botClass,
              classname:
                botClass.getClassname?.() ||
                path.split("/").pop().replace(".js", ""),
              model: botClass._model,
              logo: botClass._logo || "",
              category: botClass._category || "general",
              requiresApiKey: botClass._requiresApiKey || false,
            });
          }
        } catch (error) {
          console.warn(`Failed to load bot module ${path}:`, error);
        }
      }

      bots.value = botList;
      isInitialized.value = true;
    } catch (error) {
      console.error("Failed to initialize bots:", error);
      initializationError.value = error;
      isInitialized.value = false;
    }
  }

  async function createBotInstance(botClassname) {
    const botInfo = bots.value.find((b) => b.classname === botClassname);
    if (!botInfo) return null;

    try {
      const config = getBotConfig(botClassname);
      const instance = new botInfo.class(config);
      botInstances.value[botClassname] = instance;
      return instance;
    } catch (error) {
      console.error(
        `Failed to create bot instance for ${botClassname}:`,
        error,
      );
      return null;
    }
  }

  function getBotInstance(botClassname) {
    return botInstances.value[botClassname] || null;
  }

  function removeBotInstance(botClassname) {
    const instance = botInstances.value[botClassname];
    if (instance && typeof instance.close === "function") {
      instance.close();
    }
    delete botInstances.value[botClassname];
  }

  async function checkBotOnlineStatus(botClassname) {
    const instance = getBotInstance(botClassname);
    if (!instance) {
      setBotStatus(botClassname, "offline");
      return false;
    }

    setBotStatus(botClassname, "checking");

    try {
      if (typeof instance.checkAvailability === "function") {
        const isOnline = await instance.checkAvailability();
        setBotStatus(botClassname, isOnline ? "online" : "offline");
        return isOnline;
      }
      setBotStatus(botClassname, "online");
      return true;
    } catch (error) {
      console.error(`Failed to check status for ${botClassname}:`, error);
      setBotStatus(botClassname, "error");
      return false;
    }
  }

  async function checkAllBotsOnlineStatus() {
    const promises = activeBots.value.map((bot) =>
      checkBotOnlineStatus(bot.classname),
    );
    await Promise.all(promises);
  }

  async function setActiveBotClassnames(classnames) {
    activeBots.value = classnames.map((classname) => {
      const botInfo = bots.value.find((b) => b.classname === classname);
      return botInfo || { classname, class: null, model: classname, logo: "" };
    });
  }

  function getBotByClassname(classname) {
    return bots.value.find((b) => b.classname === classname) || null;
  }

  function getBotsByCategory(category) {
    return bots.value.filter((b) => b.category === category);
  }

  function getBotCategories() {
    const categories = new Set(bots.value.map((b) => b.category));
    return Array.from(categories);
  }

  async function testBotConnection(botClassname) {
    const instance =
      getBotInstance(botClassname) || (await createBotInstance(botClassname));
    if (!instance) {
      return { success: false, error: "Failed to create bot instance" };
    }

    try {
      setBotStatus(botClassname, "testing");
      const result = (await instance.testConnection?.()) || { success: true };
      setBotStatus(botClassname, result.success ? "online" : "error");
      return result;
    } catch (error) {
      setBotStatus(botClassname, "error");
      return { success: false, error: error.message };
    }
  }

  function clearBotCache() {
    Object.keys(botInstances.value).forEach((classname) => {
      removeBotInstance(classname);
    });
    botInstances.value = {};
  }

  function resetBotStatus() {
    Object.keys(botStatus.value).forEach((classname) => {
      botStatus.value[classname] = "idle";
    });
  }

  return {
    bots,
    activeBots,
    botConfigs,
    botStatus,
    botInstances,
    isInitialized,
    initializationError,
    availableBots,
    onlineBots,
    offlineBots,
    loadingBots,
    loadBotConfigs,
    saveBotConfigs,
    updateBotConfig,
    getBotConfig,
    getApiKey,
    setBotStatus,
    getBotStatus,
    initBots,
    createBotInstance,
    getBotInstance,
    removeBotInstance,
    checkBotOnlineStatus,
    checkAllBotsOnlineStatus,
    setActiveBotClassnames,
    getBotByClassname,
    getBotsByCategory,
    getBotCategories,
    testBotConnection,
    clearBotCache,
    resetBotStatus,
  };
});
