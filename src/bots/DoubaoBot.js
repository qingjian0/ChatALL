import AsyncLock from "async-lock";
import Bot from "@/bots/Bot";
import axios from "axios";
import store from "@/store";
import { SSE } from "sse.js";

export default class DoubaoBot extends Bot {
  static _brandId = "doubao";
  static _className = "DoubaoBot";
  static _logoFilename = "default-logo.svg";
  static _loginUrl = "https://www.doubao.com/";
  static _lock = new AsyncLock();

  constructor() {
    super();
  }

  async _checkAvailability() {
    return !!store.state.doubao?.token;
  }

  async _sendPrompt(prompt, onUpdateResponse, callbackParam) {
    const context = await this.getChatContext();
    return new Promise((resolve, reject) => {
      onUpdateResponse(callbackParam, {
        content: "豆包功能正在开发中...",
        done: true,
      });
      resolve();
    });
  }

  async createChatContext() {
    return {};
  }
}
