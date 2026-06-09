import LangChainBot from "@/bots/LangChainBot";
import store from "@/store";
import { ChatOpenAI } from "@langchain/openai";
import AsyncLock from "async-lock";

export default class DoubaoBot extends LangChainBot {
  static _brandId = "doubao";
  static _className = "DoubaoBot";
  static _logoFilename = "default-logo.svg";
  static _lock = new AsyncLock();

  constructor() {
    super();
  }

  async _checkAvailability() {
    let available = false;
    const { apiKey, modelId } = store.state.doubao;
    if (apiKey && modelId) {
      this.setupModel();
      available = true;
    }
    return available;
  }

  _setupModel() {
    const { apiKey, modelId, baseUrl, temperature } = store.state.doubao;
    const chatModel = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: modelId,
      temperature: temperature ?? 0.7,
      configuration: {
        basePath: baseUrl || "https://ark.cn-beijing.volces.com/api/v3",
      },
      streaming: true,
    });
    return chatModel;
  }

  getPastRounds() {
    return store.state.doubao?.pastRounds ?? 5;
  }
}
