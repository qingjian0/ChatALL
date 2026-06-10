import { detectPlatform, PlatformType } from "./platformDetector";

let mockPlatform = null;
let mockStorage = {};
let mockDialogs = [];
let mockCallbacks = {};
let ipcEventHandlers = {};

export function setMockPlatform(platform) {
  mockPlatform = platform;
}

export function resetMockPlatform() {
  mockPlatform = null;
}

export function isMockMode() {
  return mockPlatform !== null;
}

export function getMockPlatform() {
  return mockPlatform;
}

export const mockIpcs = {
  on(channel, handler) {
    if (!ipcEventHandlers[channel]) {
      ipcEventHandlers[channel] = [];
    }
    ipcEventHandlers[channel].push(handler);
    return () => {
      ipcEventHandlers[channel] = ipcEventHandlers[channel].filter(
        (h) => h !== handler,
      );
    };
  },

  removeListener(channel, handler) {
    if (ipcEventHandlers[channel]) {
      ipcEventHandlers[channel] = ipcEventHandlers[channel].filter(
        (h) => h !== handler,
      );
    }
  },

  removeAllListeners(channel) {
    if (channel) {
      delete ipcEventHandlers[channel];
    } else {
      ipcEventHandlers = {};
    }
  },

  invoke(channel, payload) {
    const handlers = ipcEventHandlers[channel] || [];
    return Promise.all(handlers.map((h) => h(payload)));
  },

  send(channel, payload) {
    const handlers = ipcEventHandlers[channel] || [];
    handlers.forEach((h) => h(payload));
  },

  emit(channel, payload) {
    const handlers = ipcEventHandlers[channel] || [];
    handlers.forEach((h) => h(payload));
  },
};

export const mockShell = {
  openExternal(url) {
    console.log("[Mock Shell] openExternal:", url);
    return Promise.resolve();
  },

  openPath(path) {
    console.log("[Mock Shell] openPath:", path);
    return Promise.resolve();
  },

  showItemInFolder(path) {
    console.log("[Mock Shell] showItemInFolder:", path);
    return Promise.resolve();
  },

  beep() {
    console.log("[Mock Shell] beep");
  },

  writeText(text) {
    console.log(
      "[Mock Shell] writeText:",
      text?.slice(0, 50) + (text?.length > 50 ? "..." : ""),
    );
    return Promise.resolve();
  },

  readText() {
    return Promise.resolve("");
  },
};

export const mockDialog = {
  showMessageBox(options) {
    console.log("[Mock Dialog] showMessageBox:", options?.message);
    mockDialogs.push({
      type: "messageBox",
      options,
      response: { response: 0, checkboxChecked: false },
    });
    return Promise.resolve({ response: 0, checkboxChecked: false });
  },

  showOpenDialog(options) {
    console.log("[Mock Dialog] showOpenDialog");
    mockDialogs.push({
      type: "openDialog",
      options,
      response: { canceled: true, filePaths: [] },
    });
    return Promise.resolve({ canceled: true, filePaths: [] });
  },

  showSaveDialog(options) {
    console.log("[Mock Dialog] showSaveDialog");
    mockDialogs.push({
      type: "saveDialog",
      options,
      response: { canceled: true, filePath: null },
    });
    return Promise.resolve({ canceled: true, filePath: null });
  },

  showErrorBox(title, content) {
    console.log("[Mock Dialog] showErrorBox:", title, content);
  },

  getMockDialogs() {
    return [...mockDialogs];
  },

  clearMockDialogs() {
    mockDialogs = [];
  },
};

export const mockStorage = {
  getItem(key) {
    return mockStorage[key] ?? null;
  },

  setItem(key, value) {
    mockStorage[key] = value;
  },

  removeItem(key) {
    delete mockStorage[key];
  },

  clear() {
    mockStorage = {};
  },
};

export function getMockCallbacks(name) {
  return mockCallbacks[name] || [];
}

export function clearMockCallbacks(name) {
  if (name) {
    delete mockCallbacks[name];
  } else {
    mockCallbacks = {};
  }
}

export function resetAllMocks() {
  mockPlatform = null;
  mockStorage = {};
  mockDialogs = [];
  mockCallbacks = {};
  ipcEventHandlers = {};
}

export function setupTestEnvironment() {
  resetAllMocks();
  setMockPlatform(PlatformType.WEB);
  return {
    ipc: mockIpcs,
    shell: mockShell,
    dialog: mockDialog,
    storage: mockStorage,
    reset: resetAllMocks,
  };
}

export default {
  setMockPlatform,
  resetMockPlatform,
  isMockMode,
  getMockPlatform,
  mockIpcs,
  mockShell,
  mockDialog,
  mockStorage,
  setupTestEnvironment,
  resetAllMocks,
};
