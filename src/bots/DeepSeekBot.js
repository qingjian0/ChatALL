import LangChainBot from "@/bots/LangChainBot";
import store from "@/store";
import { ChatOpenAI } from "@langchain/openai";
import AsyncLock from "async-lock";

export default class DeepSeekBot extends LangChainBot {
  static _brandId = "deepseek";
  static _className = "DeepSeekBot";
  static _logoFilename = "default-logo.svg";
  static _lock = new AsyncLock();

  constructor() {
    super();
  }

  async _checkAvailability() {
    let available = false;
    const { apiKey } = store.state.deepseek;
    if (apiKey) {
      this.setupModel();
      available = true;
    }
    return available;
  }

  _setupModel() {
    const { apiKey, modelId, baseUrl, temperature } = store.state.deepseek;
    const chatModel = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: modelId || "deepseek-chat",
      temperature: temperature || 0.7,
      configuration: {
        basePath: baseUrl || "https://api.deepseek.com",
      },
      streaming: true,
    });
    return chatModel;
  }

  getPastRounds() {
    return store.state.deepseek?.pastRounds ?? 5;
  }
}
