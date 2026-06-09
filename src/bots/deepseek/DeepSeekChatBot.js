import DeepSeekBot from "./DeepSeekBot";

export default class DeepSeekChatBot extends DeepSeekBot {
  static _brandId = "deepseek";
  static _className = "DeepSeekChatBot";
  static _model = "deepseek-chat";
  static _logoFilename = "default-logo.svg";

  constructor() {
    super();
  }
}
