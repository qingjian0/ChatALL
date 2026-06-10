<template> <login-setting :bot="bot"></login-setting> </template>

<script>
import { mapMutations } from "vuex";
import { ipcRenderer } from "@/adapters";

import Bot from "@/bots/moonshot/KimiBot";
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
    // Listen for the KIMI-TOKENS message from background.js
    ipcRenderer.on("KIMI-TOKENS", (event, tokens) => {
      this.setKimi(tokens);
    });
  },
  methods: {
    ...mapMutations(["setKimi"]),
  },
};
</script>

