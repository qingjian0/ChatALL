import LangChainBot from "@/bots/LangChainBot";
import store from "@/store";
import { ChatOpenAI } from "@langchain/openai";

export default class DoubaoBot extends LangChainBot {
  static _brandId = "doubao";
  static _className = "DoubaoBot";
  static _logoFilename = "default-logo.svg";
  static _loginUrl = "https://www.volcengine.com/docs/82379";

  constructor() {
    super();
  }

  async _checkAvailability() {
    let available = false;
    if (store.state.doubao?.apiKey && store.state.doubao?.modelId) {
      this.setupModel();
      available = true;
    }
    return available;
  }

  _setupModel() {
    const chatModel = new ChatOpenAI({
      configuration: {
        basePath: store.state.doubao.baseUrl ||
          "https://ark.cn-beijing.volces.com/api/v3",
      },
      openAIApiKey: store.state.doubao.apiKey,
      modelName: store.state.doubao.modelId,
      temperature: store.state.doubao.temperature ?? 0.7,
      streaming: true,
    });
    return chatModel;
  }

  getPastRounds() {
    return store.state.doubao?.pastRounds ?? 5;
  }
}
