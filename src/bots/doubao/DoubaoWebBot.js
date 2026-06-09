import AsyncLock from "async-lock";
import Bot from "@/bots/Bot";
import axios from "axios";
import store from "@/store";
import { SSE } from "sse.js";

export default class DoubaoWebBot extends Bot {
  static _brandId = "doubao";
  static _className = "DoubaoWebBot";
  static _logoFilename = "default-logo.svg";
  static _loginUrl = "https://www.doubao.com/";
  static _lock = new AsyncLock();

  constructor() {
    super();
  }

  getAuthHeader() {
    return {
      headers: {
        Authorization: `Bearer ${store.state.doubaoWeb?.token}`,
      },
    };
  }

  async _checkAvailability() {
    let available = false;
    try {
      const response = await axios.get(
        "https://www.doubao.com/api/user/info",
        this.getAuthHeader()
      );
      available = response.data?.code === 0;
    } catch (error) {
      console.error("Error checking Doubao login status:", error);
    }
    return available;
  }

  async _sendPrompt(prompt, onUpdateResponse, callbackParam) {
    let context = await this.getChatContext();

    return new Promise((resolve, reject) => {
      try {
        const source = new SSE(
          `https://www.doubao.com/api/chat`,
          {
            headers: this.getAuthHeader().headers,
            payload: JSON.stringify({
              query: prompt,
              conversation_id: context.conversation_id,
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
              if (data.text) {
                text += data.text;
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
        "https://www.doubao.com/api/chat/create",
        {},
        this.getAuthHeader()
      )
      .then((response) => {
        context = {
          conversation_id: response.data?.data?.conversation_id,
        };
      })
      .catch((error) => {
        console.error("Error Doubao createChatContext ", error);
      });
    return context;
  }
}
