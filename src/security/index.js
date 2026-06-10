import { encrypt, decrypt } from "./secureStorage";
import { passwordManager } from "./passwordManager";
import {
  log,
  logError,
  logWarn,
  logInfo,
  captureError,
  sanitizeLog,
  stringifySanitized,
} from "./logSanitizer";
import { requestSigner } from "./requestSigner";
import { securityMonitor } from "./securityMonitor";
import { corsProxy } from "./corsProxy";

const SECURE_STORAGE_KEY = "chatall-secure-vault";

export async function secureStorageSet(key, value, password = null) {
  const actualPassword = password || passwordManager.getPassword();
  
  if (!value) {
    await secureStorageRemove(key);
    return null;
  }
  
  const encryptedValue = await encrypt(value, actualPassword);
  
  const vault = await getVault();
  vault[key] = encryptedValue;
  await saveVault(vault);
  
  return encryptedValue;
}

export async function secureStorageGet(key, password = null) {
  const vault = await getVault();
  
  if (!vault[key]) {
    return null;
  }
  
  const actualPassword = password || passwordManager.getPassword();
  return decrypt(vault[key], actualPassword);
}

export async function secureStorageRemove(key) {
  const vault = await getVault();
  delete vault[key];
  await saveVault(vault);
}

export async function secureStorageClearAll() {
  await localStorage.removeItem(SECURE_STORAGE_KEY);
}

export async function secureStorageHas(key) {
  const vault = await getVault();
  return key in vault;
}

export async function secureStorageKeys() {
  const vault = await getVault();
  return Object.keys(vault);
}

async function getVault() {
  try {
    const data = localStorage.getItem(SECURE_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

async function saveVault(vault) {
  localStorage.setItem(SECURE_STORAGE_KEY, JSON.stringify(vault));
}

export async function migrateToSecureStorage(store) {
  const sensitiveFields = [
    { path: "openaiApi.apiKey", key: "openaiApi.apiKey" },
    { path: "claudeApi.apiKey", key: "claudeApi.apiKey" },
    { path: "geminiApi.apiKey", key: "geminiApi.apiKey" },
    { path: "cohereApi.apiKey", key: "cohereApi.apiKey" },
    { path: "azureOpenaiApi.azureApiKey", key: "azureOpenaiApi.azureApiKey" },
    { path: "groqApi.apiKey", key: "groqApi.apiKey" },
    { path: "moss.token", key: "moss.token" },
    { path: "chatGlm.token", key: "chatGlm.token" },
    { path: "kimi.access_token", key: "kimi.access_token" },
    { path: "kimi.refresh_token", key: "kimi.refresh_token" },
    { path: "doubao.apiKey", key: "doubao.apiKey" },
    { path: "doubaoWeb.token", key: "doubaoWeb.token" },
    { path: "deepseek.apiKey", key: "deepseek.apiKey" },
    { path: "deepseekWeb.token", key: "deepseekWeb.token" },
    { path: "chatglmApi.apiKey", key: "chatglmApi.apiKey" },
    { path: "qwenApi.apiKey", key: "qwenApi.apiKey" },
    { path: "sparkApi.apiKey", key: "sparkApi.apiKey" },
    { path: "miniMaxApi.apiKey", key: "miniMaxApi.apiKey" },
    { path: "miniMaxWeb.token", key: "miniMaxWeb.token" },
    { path: "qianWen.xsrfToken", key: "qianWen.xsrfToken" },
    { path: "skyWork.inviteToken", key: "skyWork.inviteToken" },
    { path: "skyWork.token", key: "skyWork.token" },
    { path: "wenxinQianfan.apiKey", key: "wenxinQianfan.apiKey" },
    { path: "wenxinQianfan.secretKey", key: "wenxinQianfan.secretKey" },
    { path: "characterAI.id", key: "characterAI.id" },
    { path: "poe.formkey", key: "poe.formkey" },
    { path: "xaiApi.apiKey", key: "xaiApi.apiKey" },
  ];
  
  const password = passwordManager.getPassword();
  const migrationResults = [];
  
  for (const { path, key } of sensitiveFields) {
    try {
      const value = getNestedValue(store.state, path);
      if (value && typeof value === "string" && value.length > 0) {
        await secureStorageSet(key, value, password);
        setNestedValue(store.state, path, "");
        migrationResults.push({ key, migrated: true });
      }
    } catch (error) {
      migrationResults.push({ key, migrated: false, error: error.message });
      logError(`Failed to migrate ${key}:`, error);
    }
  }
  
  return migrationResults;
}

function getNestedValue(obj, path) {
  return path.split(".").reduce((current, key) => current?.[key], obj);
}

function setNestedValue(obj, path, value) {
  const keys = path.split(".");
  const lastKey = keys.pop();
  const parent = keys.reduce((current, key) => current[key], obj);
  if (parent) {
    parent[lastKey] = value;
  }
}

export {
  passwordManager,
  requestSigner,
  securityMonitor,
  corsProxy,
  log,
  logError,
  logWarn,
  logInfo,
  captureError,
  sanitizeLog,
  stringifySanitized,
};

export default {
  set: secureStorageSet,
  get: secureStorageGet,
  remove: secureStorageRemove,
  clearAll: secureStorageClearAll,
  has: secureStorageHas,
  keys: secureStorageKeys,
  migrateToSecureStorage,
  passwordManager,
  requestSigner,
  securityMonitor,
  corsProxy,
};