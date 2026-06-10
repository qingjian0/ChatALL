<template> <login-setting :bot="bot"></login-setting> </template>

<script>
import Bot from "@/bots/zhipu/ChatGLMBot";
import LoginSetting from "@/components/BotSettings/LoginSetting.vue";
import { mapMutations } from "vuex";
import { ipcRenderer } from "@/adapters";

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
    // Listen for the CHATGLM-TOKEN message from background.js
    ipcRenderer.on("CHATGLM-TOKENS", (event, token) => {
      this.setChatGLM(token);
    });
  },
  methods: {
    ...mapMutations(["setChatGLM"]),
  },
};
</script>

