import LangChainBot from "@/bots/LangChainBot";
import store from "@/store";
import { ChatOpenAI } from "@langchain/openai";
import AsyncLock from "async-lock";

export default class ChatGLMAPIBot extends LangChainBot {
  static _brandId = "chatglmApi";
  static _className = "ChatGLMAPIBot";
  static _logoFilename = "default-logo.svg";
  static _lock = new AsyncLock();

  constructor() {
    super();
  }

  async _checkAvailability() {
    let available = false;
    if (store.state.chatglmApi?.apiKey) {
      this.setupModel();
      available = true;
    }
    return available;
  }

  _setupModel() {
    const { apiKey, modelId, baseUrl, temperature } = store.state.chatglmApi;
    const chatModel = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: modelId || "glm-4",
      temperature: temperature ?? 0.7,
      configuration: {
        basePath: baseUrl || "https://open.bigmodel.cn/api/paas/v4",
      },
      streaming: true,
    });
    return chatModel;
  }

  getPastRounds() {
    return store.state.chatglmApi?.pastRounds ?? 5;
  }
}
