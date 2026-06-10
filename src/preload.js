const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("require", {
  electron: {
    ipcRenderer,
  },
});

ipcRenderer.on("commit", (event, mutation, value) => {
  ipcRenderer.send("commit", mutation, value);
});

ipcRenderer.on("moss-secret", (event, secret) => {
  ipcRenderer.send("moss-secret", secret);
});

ipcRenderer.on("QIANWEN-XSRF-TOKEN", (event, token) => {
  ipcRenderer.send("QIANWEN-XSRF-TOKEN", token);
});

ipcRenderer.on("SKYWORK-TOKENS", (event, tokens) => {
  ipcRenderer.send("SKYWORK-TOKENS", tokens);
});

ipcRenderer.on("CLAUDE-2-ORG", (event, org) => {
  ipcRenderer.send("CLAUDE-2-ORG", org);
});

ipcRenderer.on("POE-FORMKEY", (event, formkey) => {
  ipcRenderer.send("POE-FORMKEY", formkey);
});

ipcRenderer.on("CHATGLM-TOKENS", (event, tokens) => {
  ipcRenderer.send("CHATGLM-TOKENS", tokens);
});

ipcRenderer.on("KIMI-TOKENS", (event, tokens) => {
  ipcRenderer.send("KIMI-TOKENS", tokens);
});

ipcRenderer.on("DOUBAO-WEB-TOKEN", (event, token) => {
  ipcRenderer.send("DOUBAO-WEB-TOKEN", token);
});

ipcRenderer.on("DEEPSEEK-WEB-TOKEN", (event, token) => {
  ipcRenderer.send("DEEPSEEK-WEB-TOKEN", token);
});

ipcRenderer.on("MINIMAX-WEB-TOKEN", (event, token) => {
  ipcRenderer.send("MINIMAX-WEB-TOKEN", token);
});
