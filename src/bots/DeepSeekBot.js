import AsyncLock from "async-lock";
import Bot from "@/bots/Bot";
import axios from "axios";
import store from "@/store";
import { SSE } from "sse.js";

export default class DeepSeekBot extends Bot {
  static _brandId = "deepseek";
  static _className = "DeepSeekBot";
  static _logoFilename = "default-logo.svg";
  static _loginUrl = "https://chat.deepseek.com/";
  static _lock = new AsyncLock();

  constructor() {
    super();
  }

  async _checkAvailability() {
    return !!store.state.deepseek?.token;
  }

  async _sendPrompt(prompt, onUpdateResponse, callbackParam) {
    const context = await this.getChatContext();
    return new Promise((resolve, reject) => {
      onUpdateResponse(callbackParam, {
        content: "DeepSeek 功能正在开发中...",
        done: true,
      });
      resolve();
    });
  }

  async createChatContext() {
    return {};
  }
}
