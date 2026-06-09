import LangChainBot from "@/bots/LangChainBot";
import store from "@/store";
import { ChatOpenAI } from "@langchain/openai";
import AsyncLock from "async-lock";

export default class MiniMaxAPIBot extends LangChainBot {
  static _brandId = "miniMax";
  static _className = "MiniMaxAPIBot";
  static _logoFilename = "default-logo.svg";
  static _lock = new AsyncLock();

  constructor() {
    super();
  }

  async _checkAvailability() {
    let available = false;
    if (store.state.miniMaxApi?.apiKey) {
      this.setupModel();
      available = true;
    }
    return available;
  }

  _setupModel() {
    const { apiKey, modelId, baseUrl, temperature } = store.state.miniMaxApi;
    const chatModel = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: modelId || "abab6.5s-chat",
      temperature: temperature ?? 0.7,
      configuration: {
        basePath: baseUrl || "https://api.minimax.chat/v1",
      },
      streaming: true,
    });
    return chatModel;
  }

  getPastRounds() {
    return store.state.miniMaxApi?.pastRounds ?? 5;
  }
}
