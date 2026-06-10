const ENCRYPTION_ALGORITHM = "AES-GCM";
const KEY_DERIVATION_ALGORITHM = "PBKDF2";
const HASH_ALGORITHM = "SHA-256";
const ITERATIONS = 100000;
const KEY_LENGTH = 256;

async function generateSalt() {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  return salt;
}

async function generateIv() {
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);
  return iv;
}

async function deriveKey(password, salt) {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: KEY_DERIVATION_ALGORITHM },
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: KEY_DERIVATION_ALGORITHM,
      salt: salt,
      iterations: ITERATIONS,
      hash: HASH_ALGORITHM,
    },
    passwordKey,
    { name: ENCRYPTION_ALGORITHM, length: KEY_LENGTH },
    true,
    ["encrypt", "decrypt"],
  );
}

async function encryptData(data, key, iv) {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);

  const encryptedData = await crypto.subtle.encrypt(
    { name: ENCRYPTION_ALGORITHM, iv: iv },
    key,
    encodedData,
  );

  return encryptedData;
}

async function decryptData(encryptedData, key, iv) {
  try {
    const decryptedData = await crypto.subtle.decrypt(
      { name: ENCRYPTION_ALGORITHM, iv: iv },
      key,
      encryptedData,
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  } catch (error) {
    throw new Error("Decryption failed. Invalid password or corrupted data.");
  }
}

function arrayBufferToBase64(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const buffer = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    view[i] = binary.charCodeAt(i);
  }
  return buffer;
}

export async function encrypt(value, password) {
  const salt = await generateSalt();
  const iv = await generateIv();
  const key = await deriveKey(password, salt);
  const encryptedData = await encryptData(value, key, iv);

  return {
    data: arrayBufferToBase64(encryptedData),
    salt: arrayBufferToBase64(salt),
    iv: arrayBufferToBase64(iv),
    algorithm: ENCRYPTION_ALGORITHM,
    iterations: ITERATIONS,
  };
}

export async function decrypt(encryptedObject, password) {
  const salt = base64ToArrayBuffer(encryptedObject.salt);
  const iv = base64ToArrayBuffer(encryptedObject.iv);
  const encryptedData = base64ToArrayBuffer(encryptedObject.data);

  const key = await deriveKey(password, salt);
  return decryptData(encryptedData, key, iv);
}

export async function generateKeyPair() {
  return crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: { name: "SHA-256" },
    },
    true,
    ["encrypt", "decrypt"],
  );
}

export async function exportKey(key, format = "jwk") {
  return crypto.subtle.exportKey(format, key);
}

export async function importKey(
  keyData,
  format = "jwk",
  keyUsages = ["encrypt", "decrypt"],
) {
  return crypto.subtle.importKey(
    format,
    keyData,
    { name: "RSA-OAEP", hash: { name: "SHA-256" } },
    true,
    keyUsages,
  );
}
