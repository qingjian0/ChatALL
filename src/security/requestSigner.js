const HASH_ALGORITHM = "SHA-256";
const TIMESTAMP_VALIDITY = 5 * 60 * 1000;
const NONCE_CACHE_SIZE = 1000;

class RequestSigner {
  constructor() {
    this.nonceCache = new Set();
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredNonces();
    }, 60 * 1000);
  }

  generateNonce() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      "",
    );
  }

  async generateSignature(params, apiSecret, timestamp, nonce) {
    const encoder = new TextEncoder();

    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join("&");

    const signatureString = `${sortedParams}&timestamp=${timestamp}&nonce=${nonce}`;

    const secretKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode(apiSecret),
      { name: "HMAC", hash: { name: HASH_ALGORITHM } },
      false,
      ["sign"],
    );

    const signature = await crypto.subtle.sign(
      "HMAC",
      secretKey,
      encoder.encode(signatureString),
    );

    return Array.from(new Uint8Array(signature))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  async signRequest(params, apiSecret) {
    const timestamp = Date.now();
    const nonce = this.generateNonce();
    const signature = await this.generateSignature(
      params,
      apiSecret,
      timestamp,
      nonce,
    );

    return {
      params,
      signature,
      timestamp,
      nonce,
    };
  }

  async verifySignature(signature, params, apiSecret, timestamp, nonce) {
    const currentTime = Date.now();

    if (Math.abs(currentTime - timestamp) > TIMESTAMP_VALIDITY) {
      throw new Error("Request expired. Timestamp is too old.");
    }

    if (this.nonceCache.has(nonce)) {
      throw new Error("Duplicate request detected. Nonce already used.");
    }

    const expectedSignature = await this.generateSignature(
      params,
      apiSecret,
      timestamp,
      nonce,
    );

    if (expectedSignature !== signature) {
      throw new Error(
        "Invalid signature. Request may have been tampered with.",
      );
    }

    this.nonceCache.add(nonce);

    if (this.nonceCache.size > NONCE_CACHE_SIZE) {
      const oldestNonces = Array.from(this.nonceCache).slice(
        0,
        NONCE_CACHE_SIZE / 2,
      );
      oldestNonces.forEach((n) => this.nonceCache.delete(n));
    }

    return true;
  }

  cleanupExpiredNonces() {
    const now = Date.now();
    for (const nonce of this.nonceCache) {
      const nonceTime = parseInt(nonce.substring(0, 8), 16) * 1000;
      if (now - nonceTime > TIMESTAMP_VALIDITY) {
        this.nonceCache.delete(nonce);
      }
    }
  }

  validateApiKey(apiKey) {
    if (!apiKey || typeof apiKey !== "string") {
      throw new Error("API Key is required");
    }

    if (apiKey.length < 16) {
      throw new Error("API Key must be at least 16 characters");
    }

    const invalidChars = /[^a-zA-Z0-9\-_]/g;
    if (invalidChars.test(apiKey)) {
      throw new Error("API Key contains invalid characters");
    }

    return true;
  }

  generateApiKey() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      "",
    );
  }

  async hashString(input) {
    const encoder = new TextEncoder();
    const hash = await crypto.subtle.digest(
      HASH_ALGORITHM,
      encoder.encode(input),
    );
    return Array.from(new Uint8Array(hash))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  destroy() {
    clearInterval(this.cleanupInterval);
    this.nonceCache.clear();
  }
}

export const requestSigner = new RequestSigner();

export default RequestSigner;
