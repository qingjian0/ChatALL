import LangChainBot from "@/bots/LangChainBot";
import store from "@/store";
import { ChatOpenAI } from "@langchain/openai";
import AsyncLock from "async-lock";

export default class SparkAPIBot extends LangChainBot {
  static _brandId = "sparkApi";
  static _className = "SparkAPIBot";
  static _logoFilename = "default-logo.svg";
  static _lock = new AsyncLock();

  constructor() {
    super();
  }

  async _checkAvailability() {
    let available = false;
    if (store.state.sparkApi?.apiKey) {
      this.setupModel();
      available = true;
    }
    return available;
  }

  _setupModel() {
    const { apiKey, modelId, baseUrl, temperature } = store.state.sparkApi;
    const chatModel = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: modelId || "generalv3.5",
      temperature: temperature ?? 0.7,
      configuration: {
        basePath: baseUrl || "https://spark-api-open.xf-yunai.cn/v1",
      },
      streaming: true,
    });
    return chatModel;
  }

  getPastRounds() {
    return store.state.sparkApi?.pastRounds ?? 5;
  }
}
