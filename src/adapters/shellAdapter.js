import { isElectron } from "./platformDetector";

function safeRequireElectron() {
  try {
    if (isElectron() && typeof window.require === "function") {
      return window.require("electron");
    }
  } catch (e) {
    // Web environment
  }
  return null;
}

const shell = {
  openExternal: async function (url) {
    const electron = safeRequireElectron();
    if (electron?.shell) {
      return electron.shell.openExternal(url);
    } else {
      return new Promise((resolve, reject) => {
        const newWindow = window.open(url, "_blank", "noopener,noreferrer");
        if (newWindow) {
          newWindow.focus();
          resolve();
        } else {
          reject(new Error("Failed to open window"));
        }
      });
    }
  },

  openPath: async function (path) {
    const electron = safeRequireElectron();
    if (electron?.shell) {
      return electron.shell.openPath(path);
    } else {
      console.warn("shell.openPath is not supported in web environment");
      return Promise.resolve("");
    }
  },

  showItemInFolder: async function (fullPath) {
    const electron = safeRequireElectron();
    if (electron?.shell) {
      return electron.shell.showItemInFolder(fullPath);
    } else {
      console.warn(
        "shell.showItemInFolder is not supported in web environment",
      );
      return Promise.resolve();
    }
  },

  beep: function () {
    const electron = safeRequireElectron();
    if (electron?.shell) {
      electron.shell.beep();
    } else {
      try {
        const audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = 800;
        oscillator.type = "sine";
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.1,
        );
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
      } catch (e) {
        console.warn("Audio not supported");
      }
    }
  },

  writeText: async function (text) {
    if (navigator.clipboard) {
      return navigator.clipboard.writeText(text);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      return Promise.resolve();
    }
  },

  readText: async function () {
    if (navigator.clipboard) {
      return navigator.clipboard.readText();
    } else {
      return Promise.resolve("");
    }
  },
};

export { shell };
