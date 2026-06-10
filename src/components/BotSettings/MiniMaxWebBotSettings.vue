<template> <login-setting :bot="bot"></login-setting> </template>

<script>
import { mapMutations } from "vuex";
import { ipcRenderer } from "@/adapters";

import Bot from "@/bots/minimax/MiniMaxWebBot";
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
    ipcRenderer.on("MINIMAX-WEB-TOKEN", (event, token) => {
      this.setMiniMaxWeb(token);
    });
  },
  methods: {
    ...mapMutations(["setMiniMaxWeb"]),
  },
};
</script>

