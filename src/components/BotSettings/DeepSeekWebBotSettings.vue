<template> <login-setting :bot="bot"></login-setting> </template>

<script>
const electron = window.require("electron");
const ipcRenderer = electron.ipcRenderer;
import { mapMutations } from "vuex";

import Bot from "@/bots/deepseek/DeepSeekWebBot";
import LoginSetting from "@/components/BotSettings/LoginSetting.vue";

export default {
  components: {
    LoginSetting,
  },
  data() {
    return {
      bot: Bot.getInstance(),
    };
  },
  mounted() {
    ipcRenderer.on("DEEPSEEK-WEB-TOKEN", (event, token) => {
      this.setDeepSeekWeb(token);
    });
  },
  methods: {
    ...mapMutations(["setDeepSeekWeb"]),
  },
};
</script>

