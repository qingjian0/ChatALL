<template>
   <CommonBotSettings
    :settings="settings"
    :brand-id="brandId"
    mutation-type="setDoubao"
    :watcher="watcher"
  ></CommonBotSettings
  >
</template>

<script>
import _bots from "@/bots";
import Bot from "@/bots/doubao/DoubaoBot";
import CommonBotSettings from "@/components/BotSettings/CommonBotSettings.vue";
import { Type } from "./settings.const";

const settings = [
  {
    type: Type.Text,
    name: "apiKey",
    title: "common.apiKey",
    description: "settings.secretPrompt",
    placeholder: "从火山引擎控制台获取 API Key",
  },
  {
    type: Type.Text,
    name: "modelId",
    title: "doubao.modelId",
    description: "doubao.modelIdPrompt",
    placeholder: "推理接入点 ID，例如 ep-xxx",
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
    title: "doubao.baseUrl",
    description: "doubao.baseUrlPrompt",
    placeholder: "https://ark.cn-beijing.volces.com/api/v3",
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

