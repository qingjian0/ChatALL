const LOCK_TIMEOUT = 5 * 60 * 1000;
const SENSITIVE_KEYS = [
  "apiKey",
  "azureApiKey",
  "token",
  "access_token",
  "refresh_token",
  "secretKey",
  "xsrfToken",
  "inviteToken",
  "formkey",
];

class PasswordManager {
  constructor() {
    this.password = null;
    this.lastAccessTime = null;
    this.lockTimer = null;
    this.isLocked = true;
    this.listeners = [];

    this.setupEventListeners();
  }

  setupEventListeners() {
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && !this.isLocked) {
        this.clearPassword();
      }
    });

    window.addEventListener("blur", () => {
      if (!this.isLocked) {
        this.clearPassword();
      }
    });

    window.addEventListener("beforeunload", () => {
      this.clearPassword();
    });
  }

  setPassword(password) {
    this.password = password;
    this.lastAccessTime = Date.now();
    this.isLocked = false;
    this.resetLockTimer();
    this.notifyListeners("unlocked");
  }

  getPassword() {
    if (this.isLocked || !this.password) {
      throw new Error("Vault is locked. Please enter your password.");
    }
    this.lastAccessTime = Date.now();
    this.resetLockTimer();
    return this.password;
  }

  clearPassword() {
    this.password = null;
    this.isLocked = true;
    this.cancelLockTimer();
    this.notifyListeners("locked");
  }

  resetLockTimer() {
    this.cancelLockTimer();
    this.lockTimer = setTimeout(() => {
      this.clearPassword();
    }, LOCK_TIMEOUT);
  }

  cancelLockTimer() {
    if (this.lockTimer) {
      clearTimeout(this.lockTimer);
      this.lockTimer = null;
    }
  }

  isVaultLocked() {
    return this.isLocked;
  }

  addListener(listener) {
    if (typeof listener === "function") {
      this.listeners.push(listener);
    }
  }

  removeListener(listener) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  notifyListeners(event) {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error("Error notifying listener:", error);
      }
    });
  }

  isSensitiveKey(key) {
    return SENSITIVE_KEYS.some((sensitiveKey) =>
      key.toLowerCase().includes(sensitiveKey.toLowerCase()),
    );
  }

  getTimeRemaining() {
    if (this.isLocked || !this.lastAccessTime) {
      return 0;
    }
    const elapsed = Date.now() - this.lastAccessTime;
    const remaining = Math.max(0, LOCK_TIMEOUT - elapsed);
    return Math.ceil(remaining / 1000);
  }

  extendSession() {
    if (!this.isLocked) {
      this.lastAccessTime = Date.now();
      this.resetLockTimer();
    }
  }
}

export const passwordManager = new PasswordManager();

export default PasswordManager;
