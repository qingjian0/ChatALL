import LangChainBot from "@/bots/LangChainBot";
import store from "@/store";
import { ChatOpenAI } from "@langchain/openai";

export default class DeepSeekBot extends LangChainBot {
  static _brandId = "deepseek";
  static _className = "DeepSeekBot";
  static _logoFilename = "default-logo.svg";
  static _loginUrl = "https://platform.deepseek.com/";
  static _model = "deepseek-chat";

  constructor() {
    super();
  }

  async _checkAvailability() {
    let available = false;
    if (store.state.deepseek?.apiKey) {
      this.setupModel();
      available = true;
    }
    return available;
  }

  _setupModel() {
    const chatModel = new ChatOpenAI({
      configuration: {
        basePath: store.state.deepseek.baseUrl ||
          "https://api.deepseek.com",
      },
      openAIApiKey: store.state.deepseek.apiKey,
      modelName: store.state.deepseek.modelId || "deepseek-chat",
      temperature: store.state.deepseek.temperature ?? 0.7,
      streaming: true,
    });
    return chatModel;
  }

  getPastRounds() {
    return store.state.deepseek?.pastRounds ?? 5;
  }
}
