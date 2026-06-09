<template>
  <CommonBotSettings
    :settings="settings"
    :brand-id="brandId"
    mutation-type="setQwenApi"
    :watcher="watcher"
  ></CommonBotSettings>
</template>

<script>
import _bots from "@/bots";
import Bot from "@/bots/qwen/QwenAPIBot";
import CommonBotSettings from "@/components/BotSettings/CommonBotSettings.vue";
import { Type } from "./settings.const";

const settings = [
  {
    type: Type.Text,
    name: "apiKey",
    title: "common.apiKey",
    description: "settings.secretPrompt",
    placeholder: "从阿里云百炼控制台获取 API Key",
  },
  {
    type: Type.Select,
    name: "modelId",
    title: "qwenApi.model",
    options: [
      { value: "qwen-turbo", title: "qwen-turbo" },
      { value: "qwen-plus", title: "qwen-plus" },
      { value: "qwen-max", title: "qwen-max" },
      { value: "qwen-long", title: "qwen-long" },
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
    title: "qwenApi.baseUrl",
    description: "qwenApi.baseUrlPrompt",
    placeholder: "https://dashscope.aliyuncs.com/compatible-mode/v1",
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
