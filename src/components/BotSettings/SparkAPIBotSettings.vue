<template>
  <CommonBotSettings
    :settings="settings"
    :brand-id="brandId"
    mutation-type="setSparkApi"
    :watcher="watcher"
  ></CommonBotSettings>
</template>

<script>
import _bots from "@/bots";
import Bot from "@/bots/spark/SparkAPIBot";
import CommonBotSettings from "@/components/BotSettings/CommonBotSettings.vue";
import { Type } from "./settings.const";

const settings = [
  {
    type: Type.Text,
    name: "apiKey",
    title: "common.apiKey",
    description: "settings.secretPrompt",
    placeholder: "从讯飞星火控制台获取 API Key",
  },
  {
    type: Type.Select,
    name: "modelId",
    title: "sparkApi.model",
    options: [
      { value: "generalv3.5", title: "generalv3.5 (Spark 4.0 Ultra)" },
      { value: "generalv3", title: "generalv3 (Spark 3.5)" },
      { value: "pro-128k", title: "pro-128k (Spark 3.5 Pro 128K)" },
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
    title: "sparkApi.baseUrl",
    description: "sparkApi.baseUrlPrompt",
    placeholder: "https://spark-api-open.xf-yunai.cn/v1",
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
