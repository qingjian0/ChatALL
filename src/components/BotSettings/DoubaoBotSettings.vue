<template> <login-setting :bot="bot"></login-setting> </template>

<script>
const electron = window.require("electron");
const ipcRenderer = electron.ipcRenderer;
import { mapMutations } from "vuex";

import Bot from "@/bots/DoubaoBot";
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
    ipcRenderer.on("DOUBAO-TOKEN", (event, token) => {
      this.setDoubao(token);
    });
  },
  methods: {
    ...mapMutations(["setDoubao"]),
  },
};
</script>
