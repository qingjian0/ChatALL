<template>
   <CommonBotSettings
    :settings="settings"
    :brand-id="brandId"
    mutation-type="setDeepSeek"
    :watcher="watcher"
  ></CommonBotSettings
  >
</template>

<script>
import _bots from "@/bots";
import Bot from "@/bots/deepseek/DeepSeekBot";
import CommonBotSettings from "@/components/BotSettings/CommonBotSettings.vue";
import { Type } from "./settings.const";

const settings = [
  {
    type: Type.Text,
    name: "apiKey",
    title: "common.apiKey",
    description: "settings.secretPrompt",
    placeholder: "sk-...",
  },
  {
    type: Type.Select,
    name: "modelId",
    title: "deepseek.model",
    options: [
      { value: "deepseek-chat", title: "deepseek-chat" },
      { value: "deepseek-reasoner", title: "deepseek-reasoner" },
      { value: "deepseek-v4-flash", title: "deepseek-v4-flash" },
      { value: "deepseek-v4-pro", title: "deepseek-v4-pro" },
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
    title: "deepseek.baseUrl",
    description: "deepseek.baseUrlPrompt",
    placeholder: "https://api.deepseek.com",
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

