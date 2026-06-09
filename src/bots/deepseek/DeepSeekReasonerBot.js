import DeepSeekBot from "./DeepSeekBot";

export default class DeepSeekReasonerBot extends DeepSeekBot {
  static _brandId = "deepseek";
  static _className = "DeepSeekReasonerBot";
  static _model = "deepseek-reasoner";
  static _logoFilename = "default-logo.svg";

  constructor() {
    super();
  }
}
