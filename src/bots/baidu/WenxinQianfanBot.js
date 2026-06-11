import LangChainBot from "@/bots/LangChainBot";
import { ChatOpenAI } from "@langchain/openai";
import AsyncLock from "async-lock";
import store from "@/store";

export default class WenxinQianfanBot extends LangChainBot {
  static _brandId = "wenxinQianfan";
  static _className = "WenxinQianfanBot";
  static _logoFilename = "wenxin-qianfan-logo.png";
  static _model = "ERNIE-Bot";
  static _lock = new AsyncLock();

  constructor() {
    super();
  }

  async _checkAvailability() {
    let available = false;
    const { apiKey, secretKey } = store.state.wenxinQianfan;
    if (apiKey && secretKey) {
      this.setupModel();
      available = true;
    }
    return available;
  }

  _setupModel() {
    const { apiKey, secretKey } = store.state.wenxinQianfan;
    const chatModel = new ChatOpenAI({
      model: this.constructor._model,
      apiKey: apiKey,
      baseURL: "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/ernie_bot",
      streaming: true,
      defaultHeaders: {
        "Content-Type": "application/json",
      },
    });
    return chatModel;
  }

  getPastRounds() {
    return store.state.wenxinQianfan.pastRounds;
  }
}
