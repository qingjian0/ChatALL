<template> <login-setting :bot="bot"></login-setting> </template>

<script>
import { mapMutations } from "vuex";
import { ipcRenderer } from "@/adapters";

import Bot from "@/bots/QianWenBot";
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
    // Listen for the QIANWEN-XSRF-TOKEN message from background.js
    ipcRenderer.on("QIANWEN-XSRF-TOKEN", (event, token) => {
      this.setQianWenToken(token);
    });
  },
  methods: {
    ...mapMutations(["setQianWenToken"]),
  },
};
</script>

