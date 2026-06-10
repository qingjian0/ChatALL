import { ref, watch, onMounted } from "vue";
import { passwordManager, secureStorageGet, secureStorageSet } from "./index";

export function useSecureStorage(key) {
  const value = ref("");
  const isLoading = ref(false);
  const error = ref(null);
  const isLocked = ref(passwordManager.isVaultLocked());
  
  passwordManager.addListener((event) => {
    isLocked.value = event === "locked";
    if (event === "locked") {
      value.value = "";
    } else {
      loadValue();
    }
  });
  
  async function loadValue() {
    if (passwordManager.isVaultLocked()) {
      value.value = "";
      return;
    }
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const stored = await secureStorageGet(key);
      value.value = stored || "";
    } catch (err) {
      error.value = err.message;
      value.value = "";
    } finally {
      isLoading.value = false;
    }
  }
  
  async function saveValue(newValue) {
    if (passwordManager.isVaultLocked()) {
      throw new Error("Vault is locked. Cannot save.");
    }
    
    isLoading.value = true;
    error.value = null;
    
    try {
      await secureStorageSet(key, newValue);
      value.value = newValue;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }
  
  watch(value, async (newVal) => {
    if (newVal !== value.value) {
      await saveValue(newVal);
    }
  });
  
  onMounted(() => {
    loadValue();
  });
  
  return {
    value,
    isLoading,
    error,
    isLocked,
    loadValue,
    saveValue,
  };
}

export function usePasswordManager() {
  const isLocked = ref(passwordManager.isVaultLocked());
  const timeRemaining = ref(passwordManager.getTimeRemaining());
  
  passwordManager.addListener((event) => {
    isLocked.value = event === "locked";
  });
  
  setInterval(() => {
    timeRemaining.value = passwordManager.getTimeRemaining();
  }, 1000);
  
  const unlock = async (password) => {
    passwordManager.setPassword(password);
    isLocked.value = false;
  };
  
  const lock = () => {
    passwordManager.clearPassword();
    isLocked.value = true;
  };
  
  const extendSession = () => {
    passwordManager.extendSession();
  };
  
  return {
    isLocked,
    timeRemaining,
    unlock,
    lock,
    extendSession,
  };
}