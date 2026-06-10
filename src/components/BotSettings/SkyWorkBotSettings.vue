<template> <login-setting :bot="bot"></login-setting> </template>

<script>
import { mapMutations } from "vuex";
import { ipcRenderer } from "@/adapters";

import Bot from "@/bots/SkyWorkBot";
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
    // Listen for the SKYWORK-TOKENS message from background.js
    ipcRenderer.on("SKYWORK-TOKENS", (event, tokens) => {
      this.setSkyWork(tokens);
    });
  },
  methods: {
    ...mapMutations(["setSkyWork"]),
  },
};
</script>

