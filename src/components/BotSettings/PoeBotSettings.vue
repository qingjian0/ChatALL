<template> <login-setting :bot="bot"></login-setting> </template>

<script>
import Bot from "@/bots/poe/PoeBot";
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
    // Listen for the POE-FORMKEY message from background.js
    ipcRenderer.on("POE-FORMKEY", (event, formkey) => {
      this.setPoe({ formkey });
    });
  },
  methods: {
    ...mapMutations(["setPoe"]),
  },
};
</script>

