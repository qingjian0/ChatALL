import LangChainBot from "@/bots/LangChainBot";
import store from "@/store";
import { ChatOpenAI } from "@langchain/openai";
import AsyncLock from "async-lock";

export default class QwenAPIBot extends LangChainBot {
  static _brandId = "qwenApi";
  static _className = "QwenAPIBot";
  static _logoFilename = "default-logo.svg";
  static _lock = new AsyncLock();

  constructor() {
    super();
  }

  async _checkAvailability() {
    let available = false;
    if (store.state.qwenApi?.apiKey) {
      this.setupModel();
      available = true;
    }
    return available;
  }

  _setupModel() {
    const { apiKey, modelId, baseUrl, temperature } = store.state.qwenApi;
    const chatModel = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: modelId || "qwen-plus",
      temperature: temperature ?? 0.7,
      configuration: {
        basePath: baseUrl || "https://dashscope.aliyuncs.com/compatible-mode/v1",
      },
      streaming: true,
    });
    return chatModel;
  }

  getPastRounds() {
    return store.state.qwenApi?.pastRounds ?? 5;
  }
}
