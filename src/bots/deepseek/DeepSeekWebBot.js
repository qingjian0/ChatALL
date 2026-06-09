import AsyncLock from "async-lock";
import Bot from "@/bots/Bot";
import axios from "axios";
import store from "@/store";
import { SSE } from "sse.js";

export default class DeepSeekWebBot extends Bot {
  static _brandId = "deepseek";
  static _className = "DeepSeekWebBot";
  static _logoFilename = "default-logo.svg";
  static _loginUrl = "https://chat.deepseek.com/";
  static _lock = new AsyncLock();

  constructor() {
    super();
  }

  getAuthHeader() {
    return {
      headers: {
        Authorization: `Bearer ${store.state.deepseekWeb?.token}`,
      },
    };
  }

  async _checkAvailability() {
    let available = false;
    try {
      const response = await axios.get(
        "https://chat.deepseek.com/api/user/info",
        this.getAuthHeader()
      );
      available = response.data?.code === 0;
    } catch (error) {
      console.error("Error checking DeepSeek login status:", error);
    }
    return available;
  }

  async _sendPrompt(prompt, onUpdateResponse, callbackParam) {
    let context = await this.getChatContext();

    return new Promise((resolve, reject) => {
      try {
        const source = new SSE(
          `https://chat.deepseek.com/api/chat/stream`,
          {
            headers: {
              ...this.getAuthHeader().headers,
              "Content-Type": "application/json",
            },
            payload: JSON.stringify({
              query: prompt,
              conversation_id: context.conversation_id || "",
              parent_msg_id: context.msg_id || "",
            }),
          }
        );

        let text = "";
        source.addEventListener("message", (event) => {
          if (event.data === "[DONE]") {
            onUpdateResponse(callbackParam, { content: text, done: true });
            resolve();
          } else {
            try {
              const data = JSON.parse(event.data);
              if (data.choices && data.choices[0].delta.content) {
                text += data.choices[0].delta.content;
                onUpdateResponse(callbackParam, {
                  content: text,
                  done: false,
                });
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        });

        source.addEventListener("error", (error) => {
          reject(error);
        });

        source.stream();
      } catch (err) {
        reject(err);
      }
    });
  }

  async createChatContext() {
    let context = null;
    await axios
      .post(
        "https://chat.deepseek.com/api/chat/conversation",
        {},
        this.getAuthHeader()
      )
      .then((response) => {
        context = {
          conversation_id: response.data?.data?.conversation_id,
        };
      })
      .catch((error) => {
        console.error("Error DeepSeek createChatContext ", error);
      });
    return context;
  }
}
