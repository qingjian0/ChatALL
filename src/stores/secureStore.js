import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useSecureStore = defineStore("secure", () => {
  const masterKey = ref(null);
  const keyCache = ref({});
  const encryptionSalt = "chatall-salt-2024";
  const securityLevel = ref("medium");
  const sessionToken = ref(null);
  const lastActivityTime = ref(Date.now());
  const isLocked = ref(false);
  const keyDerivationParams = ref({
    algorithm: "PBKDF2",
    iterations: 100000,
    hash: "SHA-256",
    keyLength: 256,
  });

  const isInitialized = computed(() => masterKey.value !== null);
  const isAuthenticated = computed(
    () => isInitialized.value && !isLocked.value,
  );

  async function generateMasterKey(password) {
    const encoder = new TextEncoder();
    const passwordBytes = encoder.encode(password);
    const saltBytes = encoder.encode(encryptionSalt);

    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      passwordBytes,
      { name: "PBKDF2" },
      false,
      ["deriveKey"],
    );

    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: saltBytes,
        iterations: keyDerivationParams.value.iterations,
        hash: keyDerivationParams.value.hash,
      },
      keyMaterial,
      { name: "AES-GCM", length: keyDerivationParams.value.keyLength },
      true,
      ["encrypt", "decrypt"],
    );
  }

  async function encrypt(data) {
    if (!masterKey.value) {
      throw new Error("Master key not set");
    }

    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(JSON.stringify(data));
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      masterKey.value,
      dataBytes,
    );

    const encryptedArray = new Uint8Array(encrypted);
    const combined = new Uint8Array(iv.length + encryptedArray.length);
    combined.set(iv, 0);
    combined.set(encryptedArray, iv.length);

    return btoa(String.fromCharCode(...combined));
  }

  async function decrypt(encryptedData) {
    if (!masterKey.value) {
      throw new Error("Master key not set");
    }

    const decoded = new Uint8Array(
      atob(encryptedData)
        .split("")
        .map((char) => char.charCodeAt(0)),
    );

    const iv = decoded.slice(0, 12);
    const data = decoded.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      masterKey.value,
      data,
    );

    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(decrypted));
  }

  async function init(password) {
    try {
      masterKey.value = await generateMasterKey(password);
      sessionToken.value = generateSecureToken(64);
      lastActivityTime.value = Date.now();
      isLocked.value = false;
      return true;
    } catch (error) {
      console.error("Failed to initialize secure store:", error);
      return false;
    }
  }

  function lock() {
    isLocked.value = true;
  }

  async function unlock(password) {
    try {
      const key = await generateMasterKey(password);
      const testData = await encrypt({ test: "data" });
      await decrypt(testData);

      masterKey.value = key;
      sessionToken.value = generateSecureToken(64);
      lastActivityTime.value = Date.now();
      isLocked.value = false;
      return true;
    } catch (error) {
      console.error("Failed to unlock secure store:", error);
      return false;
    }
  }

  function cacheApiKey(botType, apiKey) {
    keyCache.value[botType] = apiKey;
  }

  function getCachedApiKey(botType) {
    return keyCache.value[botType] || null;
  }

  function clearCache() {
    keyCache.value = {};
    sessionToken.value = null;
    lastActivityTime.value = Date.now();
  }

  function clearMasterKey() {
    masterKey.value = null;
    isLocked.value = true;
    clearCache();
  }

  function maskApiKey(apiKey) {
    if (!apiKey) return "";
    if (apiKey.length <= 8) return "*".repeat(apiKey.length);
    return (
      apiKey.slice(0, 4) + "*".repeat(apiKey.length - 8) + apiKey.slice(-4)
    );
  }

  function generateSecureToken(length = 32) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      "",
    );
  }

  async function generateKeyPair() {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"],
    );
    return keyPair;
  }

  async function exportPublicKey(key) {
    const exported = await crypto.subtle.exportKey("spki", key);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
  }

  async function exportPrivateKey(key) {
    const exported = await crypto.subtle.exportKey("pkcs8", key);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
  }

  async function importPublicKey(pem) {
    const binary = new Uint8Array(
      atob(pem)
        .split("")
        .map((c) => c.charCodeAt(0)),
    );
    return crypto.subtle.importKey(
      "spki",
      binary,
      { name: "RSA-OAEP", hash: "SHA-256" },
      true,
      ["encrypt"],
    );
  }

  async function importPrivateKey(pem) {
    const binary = new Uint8Array(
      atob(pem)
        .split("")
        .map((c) => c.charCodeAt(0)),
    );
    return crypto.subtle.importKey(
      "pkcs8",
      binary,
      { name: "RSA-OAEP", hash: "SHA-256" },
      true,
      ["decrypt"],
    );
  }

  async function encryptWithPublicKey(publicKey, data) {
    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(JSON.stringify(data));
    const encrypted = await crypto.subtle.encrypt(
      { name: "RSA-OAEP" },
      publicKey,
      dataBytes,
    );
    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  }

  async function decryptWithPrivateKey(privateKey, encryptedData) {
    const binary = new Uint8Array(
      atob(encryptedData)
        .split("")
        .map((c) => c.charCodeAt(0)),
    );
    const decrypted = await crypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      privateKey,
      binary,
    );
    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(decrypted));
  }

  function hashString(input) {
    return new Promise((resolve) => {
      const encoder = new TextEncoder();
      crypto.subtle.digest("SHA-256", encoder.encode(input)).then((hash) => {
        const hex = Array.from(new Uint8Array(hash))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        resolve(hex);
      });
    });
  }

  function generateHmac(key, data) {
    return new Promise((resolve) => {
      crypto.subtle
        .importKey(
          "raw",
          new TextEncoder().encode(key),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"],
        )
        .then((hmacKey) => {
          crypto.subtle
            .sign("HMAC", hmacKey, new TextEncoder().encode(data))
            .then((signature) => {
              resolve(btoa(String.fromCharCode(...new Uint8Array(signature))));
            });
        });
    });
  }

  function updateActivityTime() {
    lastActivityTime.value = Date.now();
  }

  function setSecurityLevel(level) {
    const validLevels = ["low", "medium", "high", "maximum"];
    if (validLevels.includes(level)) {
      securityLevel.value = level;
      if (level === "high" || level === "maximum") {
        keyDerivationParams.value.iterations =
          level === "maximum" ? 200000 : 150000;
      }
    }
  }

  function generateRecoveryKey() {
    const key = generateSecureToken(64);
    const timestamp = Date.now();
    const recoveryData = {
      key,
      timestamp,
      securityLevel: securityLevel.value,
    };
    return { key, data: recoveryData };
  }

  async function secureLocalStorageSetItem(key, value) {
    const encrypted = await encrypt(value);
    localStorage.setItem(`chatall-secure-${key}`, encrypted);
  }

  async function secureLocalStorageGetItem(key) {
    const encrypted = localStorage.getItem(`chatall-secure-${key}`);
    if (!encrypted) return null;
    return await decrypt(encrypted);
  }

  function secureLocalStorageRemoveItem(key) {
    localStorage.removeItem(`chatall-secure-${key}`);
  }

  function secureLocalStorageClear() {
    const keys = Object.keys(localStorage).filter((k) =>
      k.startsWith("chatall-secure-"),
    );
    keys.forEach((k) => localStorage.removeItem(k));
  }

  return {
    masterKey,
    keyCache,
    securityLevel,
    sessionToken,
    lastActivityTime,
    isLocked,
    keyDerivationParams,
    isInitialized,
    isAuthenticated,
    init,
    lock,
    unlock,
    encrypt,
    decrypt,
    cacheApiKey,
    getCachedApiKey,
    clearCache,
    clearMasterKey,
    maskApiKey,
    generateSecureToken,
    generateKeyPair,
    exportPublicKey,
    exportPrivateKey,
    importPublicKey,
    importPrivateKey,
    encryptWithPublicKey,
    decryptWithPrivateKey,
    hashString,
    generateHmac,
    updateActivityTime,
    setSecurityLevel,
    generateRecoveryKey,
    secureLocalStorageSetItem,
    secureLocalStorageGetItem,
    secureLocalStorageRemoveItem,
    secureLocalStorageClear,
  };
});
