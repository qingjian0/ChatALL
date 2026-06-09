<template>
   <CommonBotSettings
    :settings="settings"
    :brand-id="brandId"
    mutation-type="setChatGLMApi"
    :watcher="watcher"
  ></CommonBotSettings
  >
</template>

<script>
import _bots from "@/bots";
import Bot from "@/bots/zhipu/ChatGLMAPIBot";
import CommonBotSettings from "@/components/BotSettings/CommonBotSettings.vue";
import { Type } from "./settings.const";

const settings = [
  {
    type: Type.Text,
    name: "apiKey",
    title: "common.apiKey",
    description: "settings.secretPrompt",
    placeholder: "从智谱AI控制台获取",
  },
  {
    type: Type.Select,
    name: "modelId",
    title: "chatglmApi.model",
    options: [
      { value: "glm-4", title: "glm-4" },
      { value: "glm-4-plus", title: "glm-4-plus" },
      { value: "glm-4-flash", title: "glm-4-flash" },
      { value: "glm-3-turbo", title: "glm-3-turbo" },
    ],
  },
  {
    type: Type.Slider,
    name: "temperature",
    title: "openaiApi.temperature",
    description: "openaiApi.temperaturePrompt",
    min: 0,
    max: 2,
    step: 0.1,
    ticks: {
      0: "openaiApi.temperature0",
      2: "openaiApi.temperature2",
    },
  },
  {
    type: Type.Slider,
    name: "pastRounds",
    title: "bot.pastRounds",
    description: "bot.pastRoundsPrompt",
    min: 0,
    max: 10,
    step: 1,
  },
  {
    type: Type.Text,
    name: "baseUrl",
    title: "chatglmApi.baseUrl",
    description: "chatglmApi.baseUrlPrompt",
    placeholder: "https://open.bigmodel.cn/api/paas/v4",
  },
];
export default {
  components: {
    CommonBotSettings,
  },
  data() {
    return {
      settings: settings,
      brandId: Bot._brandId,
    };
  },
  methods: {
    watcher() {
      _bots.all
        .filter((bot) => bot instanceof Bot)
        .map((bot) => bot.setupModel());
    },
  },
};
</script>

