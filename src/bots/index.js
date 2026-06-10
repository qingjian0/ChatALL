const botModules = {
  Qihoo360AIBrainBot: () => import("./Qihoo360AIBrainBot"),
  BingChatCreativeBot: () => import("./microsoft/BingChatCreativeBot"),
  BingChatBalancedBot: () => import("./microsoft/BingChatBalancedBot"),
  BingChatPreciseBot: () => import("./microsoft/BingChatPreciseBot"),
  CharacterAIBot: () => import("./CharacterAIBot"),
  ChatGLMBot: () => import("./zhipu/ChatGLMBot"),
  ChatGLM4Bot: () => import("./zhipu/ChatGLM4Bot"),
  ClaudeAIBot: () => import("./ClaudeAIBot"),
  ClaudeAPIOpusBot: () => import("./anthropic/ClaudeAPIOpusBot"),
  ClaudeAPISonnetBot: () => import("./anthropic/ClaudeAPISonnetBot"),
  ClaudeAPI37SonnetBot: () => import("./anthropic/ClaudeAPI37SonnetBot"),
  ClaudeAPIHaikuBot: () => import("./anthropic/ClaudeAPIHaikuBot"),
  ClaudeAPI20Bot: () => import("./anthropic/ClaudeAPI20Bot"),
  ClaudeAPI21Bot: () => import("./anthropic/ClaudeAPI21Bot"),
  CohereAPICommandBot: () => import("./cohere/CohereAPICommandBot"),
  CohereAPICommandLightBot: () => import("./cohere/CohereAPICommandLightBot"),
  CohereAPICommandRBot: () => import("./cohere/CohereAPICommandRBot"),
  CohereAPICommandRPlusBot: () => import("./cohere/CohereAPICommandRPlusBot"),
  CohereAPIAya23Bot: () => import("./cohere/CohereAPIAya23Bot"),
  WenxinQianfanBot: () => import("./baidu/WenxinQianfanBot"),
  WenxinQianfanTurboBot: () => import("./baidu/WenxinQianfanTurboBot"),
  WenxinQianfan4Bot: () => import("./baidu/WenxinQianfan4Bot"),
  BardBot: () => import("./google/BardBot"),
  GeminiAdvBot: () => import("./google/GeminiAdvBot"),
  GeminiAPIBot: () => import("./google/GeminiAPIBot"),
  Gemini15ProAPIBot: () => import("./google/Gemini15ProAPIBot"),
  Gemini15FlashAPIBot: () => import("./google/Gemini15FlashAPIBot"),
  Gemini20FlashAPIBot: () => import("./google/Gemini20FlashAPIBot"),
  Gemini20FlashLiteAPIBot: () => import("./google/Gemini20FlashLiteAPIBot"),
  AzureOpenAIAPIBot: () => import("./microsoft/AzureOpenAIAPIBot"),
  OpenAIAPI35Bot: () => import("./openai/OpenAIAPI35Bot"),
  ChatGPT4Bot: () => import("./openai/ChatGPT4Bot"),
  OpenAIAPI4Bot: () => import("./openai/OpenAIAPI4Bot"),
  OpenAIAPI4128KBot: () => import("./openai/OpenAIAPI4128KBot"),
  OpenAIAPI4oBot: () => import("./openai/OpenAIAPI4oBot"),
  OpenAIAPI4oMiniBot: () => import("./openai/OpenAIAPI4oMiniBot"),
  OpenAIAPI41Bot: () => import("./openai/OpenAIAPI41Bot"),
  OpenAIAPI41MiniBot: () => import("./openai/OpenAIAPI41MiniBot"),
  OpenAIAPI41NanoBot: () => import("./openai/OpenAIAPI41NanoBot"),
  OpenAIAPIo1Bot: () => import("./openai/OpenAIAPIo1Bot"),
  OpenAIAPIo1MiniBot: () => import("./openai/OpenAIAPIo1MiniBot"),
  OpenAIAPIo3Bot: () => import("./openai/OpenAIAPIo3Bot"),
  OpenAIAPIo3MiniBot: () => import("./openai/OpenAIAPIo3MiniBot"),
  OpenAIAPIo4MiniBot: () => import("./openai/OpenAIAPIo4MiniBot"),
  OpenAIAPI45Bot: () => import("./openai/OpenAIAPI45Bot"),
  GradioAppBot: () => import("./huggingface/GradioAppBot"),
  Gemma7bGroqAPIBot: () => import("./groq/Gemma7bGroqAPIBot"),
  Gemma29bGroqAPIBot: () => import("./groq/Gemma29bGroqAPIBot"),
  Llama38bGroqAPIBot: () => import("./groq/Llama38bGroqAPIBot"),
  Llama370bGroqAPIBot: () => import("./groq/Llama370bGroqAPIBot"),
  Llama4ScoutGroqAPIBot: () => import("./groq/Llama4ScoutGroqAPIBot"),
  Llama4MaverickGroqAPIBot: () => import("./groq/Llama4MaverickGroqAPIBot"),
  KimiBot: () => import("./moonshot/KimiBot"),
  DoubaoBot: () => import("./doubao/DoubaoBot"),
  DoubaoWebBot: () => import("./doubao/DoubaoWebBot"),
  DeepSeekBot: () => import("./deepseek/DeepSeekBot"),
  DeepSeekWebBot: () => import("./deepseek/DeepSeekWebBot"),
  DeepSeekChatBot: () => import("./deepseek/DeepSeekChatBot"),
  DeepSeekReasonerBot: () => import("./deepseek/DeepSeekReasonerBot"),
  ChatGLMAPIBot: () => import("./zhipu/ChatGLMAPIBot"),
  QwenAPIBot: () => import("./qwen/QwenAPIBot"),
  SparkAPIBot: () => import("./spark/SparkAPIBot"),
  MiniMaxAPIBot: () => import("./minimax/MiniMaxAPIBot"),
  MiniMaxWebBot: () => import("./minimax/MiniMaxWebBot"),
  MistralBot: () => import("./MistralBot"),
  MOSSBot: () => import("./MOSSBot"),
  HuggingChatBot: () => import("./huggingface/HuggingChatBot"),
  PerplexityBot: () => import("./PerplexityBot"),
  PhindBot: () => import("./PhindBot"),
  PiBot: () => import("./PiBot"),
  QianWenBot: () => import("./QianWenBot"),
  SkyWorkBot: () => import("./SkyWorkBot"),
  SparkBot: () => import("./SparkBot"),
  YouChatBot: () => import("./YouChatBot"),
  Grok2APIBot: () => import("./xai/Grok2APIBot"),
  Grok3APIBot: () => import("./xai/Grok3APIBot"),
  Grok3MiniAPIBot: () => import("./xai/Grok3MiniAPIBot"),
};

const disabled = ["HuggingChatBot"];

const botClassNames = [
  "Qihoo360AIBrainBot",
  "BingChatCreativeBot",
  "BingChatBalancedBot",
  "BingChatPreciseBot",
  "CharacterAIBot",
  "ChatGLMBot",
  "ChatGLM4Bot",
  "ClaudeAIBot",
  "ClaudeAPIOpusBot",
  "ClaudeAPISonnetBot",
  "ClaudeAPI37SonnetBot",
  "ClaudeAPIHaikuBot",
  "ClaudeAPI20Bot",
  "ClaudeAPI21Bot",
  "CohereAPICommandBot",
  "CohereAPICommandLightBot",
  "CohereAPICommandRBot",
  "CohereAPICommandRPlusBot",
  "CohereAPIAya23Bot",
  "WenxinQianfanBot",
  "WenxinQianfanTurboBot",
  "WenxinQianfan4Bot",
  "BardBot",
  "GeminiAdvBot",
  "GeminiAPIBot",
  "Gemini15ProAPIBot",
  "Gemini15FlashAPIBot",
  "Gemini20FlashAPIBot",
  "Gemini20FlashLiteAPIBot",
  "AzureOpenAIAPIBot",
  "OpenAIAPI35Bot",
  "ChatGPT4Bot",
  "OpenAIAPI4Bot",
  "OpenAIAPI4128KBot",
  "OpenAIAPI4oBot",
  "OpenAIAPI4oMiniBot",
  "OpenAIAPI41Bot",
  "OpenAIAPI41MiniBot",
  "OpenAIAPI41NanoBot",
  "OpenAIAPIo1Bot",
  "OpenAIAPIo1MiniBot",
  "OpenAIAPIo3Bot",
  "OpenAIAPIo3MiniBot",
  "OpenAIAPIo4MiniBot",
  "OpenAIAPI45Bot",
  "GradioAppBot",
  "Gemma7bGroqAPIBot",
  "Gemma29bGroqAPIBot",
  "Llama38bGroqAPIBot",
  "Llama370bGroqAPIBot",
  "Llama4ScoutGroqAPIBot",
  "Llama4MaverickGroqAPIBot",
  "KimiBot",
  "DoubaoBot",
  "DoubaoWebBot",
  "DeepSeekBot",
  "DeepSeekWebBot",
  "DeepSeekChatBot",
  "DeepSeekReasonerBot",
  "ChatGLMAPIBot",
  "QwenAPIBot",
  "SparkAPIBot",
  "MiniMaxAPIBot",
  "MiniMaxWebBot",
  "MistralBot",
  "MOSSBot",
  "HuggingChatBot",
  "PerplexityBot",
  "PhindBot",
  "PiBot",
  "QianWenBot",
  "SkyWorkBot",
  "SparkBot",
  "YouChatBot",
  "Grok2APIBot",
  "Grok3APIBot",
  "Grok3MiniAPIBot",
];

const loadedBots = new Map();

export async function loadBot(className) {
  if (loadedBots.has(className)) {
    return loadedBots.get(className);
  }

  const moduleLoader = botModules[className];
  if (!moduleLoader) {
    throw new Error(`Bot module not found: ${className}`);
  }

  try {
    const module = await moduleLoader();
    const BotClass = module.default || module[className];
    const instance = BotClass.getInstance();

    if (disabled.includes(className)) {
      instance.disable();
    }

    loadedBots.set(className, instance);
    return instance;
  } catch (error) {
    console.error(`Failed to load bot: ${className}`, error);
    throw error;
  }
}

export async function loadAllBots() {
  const promises = botClassNames.map((className) => loadBot(className));

  if (process.env.NODE_ENV !== "production") {
    const DevBot = (await import("./DevBot")).default;
    promises.push(
      DevBot.getInstance().then((instance) => {
        loadedBots.set("DevBot", instance);
        return instance;
      }),
    );
  }

  const allBots = await Promise.all(promises);

  return {
    all: allBots,
    getBotByClassName(className) {
      return loadedBots.get(className);
    },
  };
}

export async function loadEssentialBots() {
  const essentialClassNames = [
    "BingChatBalancedBot",
    "ChatGPT4Bot",
    "GeminiAPIBot",
    "KimiBot",
    "OpenAIAPI35Bot",
  ];

  const promises = essentialClassNames.map((className) => loadBot(className));
  return await Promise.all(promises);
}

export const botTags = {
  free: [
    "BardBot",
    "BingChatBalancedBot",
    "BingChatCreativeBot",
    "BingChatPreciseBot",
    "ChatGLMBot",
    "ChatGLM4Bot",
    "HuggingChatBot",
    "MistralBot",
    "MOSSBot",
    "Qihoo360AIBrainBot",
    "QianWenBot",
    "SkyWorkBot",
    "SparkBot",
    "YouChatBot",
    "GradioAppBot",
    "CharacterAIBot",
    "ClaudeAIBot",
    "PerplexityBot",
    "PhindBot",
    "PiBot",
    "KimiBot",
    "DoubaoWebBot",
    "DeepSeekWebBot",
    "MiniMaxWebBot",
  ],
  paid: ["ChatGPT4Bot", "GeminiAdvBot"],
  openSource: ["HuggingChatBot", "MOSSBot"],
  api: [
    "GeminiAPIBot",
    "Gemini15ProAPIBot",
    "Gemini15FlashAPIBot",
    "Gemini20FlashAPIBot",
    "Gemini20FlashLiteAPIBot",
    "AzureOpenAIAPIBot",
    "OpenAIAPI35Bot",
    "OpenAIAPI4Bot",
    "OpenAIAPI4128KBot",
    "OpenAIAPI4oBot",
    "OpenAIAPI4oMiniBot",
    "OpenAIAPI41Bot",
    "OpenAIAPI41MiniBot",
    "OpenAIAPI41NanoBot",
    "OpenAIAPIo1Bot",
    "OpenAIAPIo1MiniBot",
    "OpenAIAPIo3Bot",
    "OpenAIAPIo3MiniBot",
    "OpenAIAPIo4MiniBot",
    "OpenAIAPI45Bot",
    "WenxinQianfanBot",
    "WenxinQianfanTurboBot",
    "WenxinQianfan4Bot",
    "ClaudeAPI20Bot",
    "ClaudeAPI21Bot",
    "ClaudeAPIHaikuBot",
    "ClaudeAPIOpusBot",
    "ClaudeAPISonnetBot",
    "ClaudeAPI37SonnetBot",
    "CohereAPICommandBot",
    "CohereAPICommandLightBot",
    "CohereAPICommandRBot",
    "CohereAPICommandRPlusBot",
    "CohereAPIAya23Bot",
    "Gemma7bGroqAPIBot",
    "Gemma29bGroqAPIBot",
    "Llama38bGroqAPIBot",
    "Llama370bGroqAPIBot",
    "Llama4ScoutGroqAPIBot",
    "Llama4MaverickGroqAPIBot",
    "Grok2APIBot",
    "Grok3APIBot",
    "Grok3MiniAPIBot",
    "DoubaoBot",
    "DeepSeekBot",
    "DeepSeekChatBot",
    "DeepSeekReasonerBot",
    "ChatGLMAPIBot",
    "QwenAPIBot",
    "SparkAPIBot",
    "MiniMaxAPIBot",
  ],
  web: ["DoubaoWebBot", "DeepSeekWebBot", "MiniMaxWebBot"],
  madeInChina: [
    "Qihoo360AIBrainBot",
    "QianWenBot",
    "SkyWorkBot",
    "SparkBot",
    "WenxinQianfanBot",
    "WenxinQianfanTurboBot",
    "WenxinQianfan4Bot",
    "MOSSBot",
    "ChatGLMBot",
    "ChatGLM4Bot",
    "KimiBot",
    "DoubaoBot",
    "DoubaoWebBot",
    "DeepSeekBot",
    "DeepSeekWebBot",
    "DeepSeekChatBot",
    "DeepSeekReasonerBot",
    "ChatGLMAPIBot",
    "QwenAPIBot",
    "SparkAPIBot",
    "MiniMaxAPIBot",
    "MiniMaxWebBot",
  ],
};

export async function getBotTagsWithInstances() {
  const result = {};
  for (const [tag, classNames] of Object.entries(botTags)) {
    result[tag] = await Promise.all(
      classNames.map((className) => loadBot(className)),
    );
  }
  return result;
}

export { botClassNames };
