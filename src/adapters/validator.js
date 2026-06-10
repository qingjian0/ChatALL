import { ErrorCode, AdapterError } from "./errorHandler";

export function validateString(value, name = "value") {
  if (typeof value !== "string") {
    throw new AdapterError(
      `${name} must be a string`,
      ErrorCode.INVALID_PARAMS,
      { name, type: typeof value },
    );
  }
  return value;
}

export function validateNumber(
  value,
  name = "value",
  { min = -Infinity, max = Infinity, integer = false } = {},
) {
  if (typeof value !== "number" || isNaN(value)) {
    throw new AdapterError(
      `${name} must be a number`,
      ErrorCode.INVALID_PARAMS,
      { name, type: typeof value },
    );
  }
  if (value < min || value > max) {
    throw new AdapterError(
      `${name} out of range [${min}, ${max}]`,
      ErrorCode.INVALID_PARAMS,
      { name, value, min, max },
    );
  }
  if (integer && !Number.isInteger(value)) {
    throw new AdapterError(
      `${name} must be an integer`,
      ErrorCode.INVALID_PARAMS,
      { name, value },
    );
  }
  return value;
}

export function validateBoolean(value, name = "value") {
  if (typeof value !== "boolean") {
    throw new AdapterError(
      `${name} must be a boolean`,
      ErrorCode.INVALID_PARAMS,
      { name, type: typeof value },
    );
  }
  return value;
}

export function validateObject(
  value,
  name = "value",
  { nullable = false } = {},
) {
  if (value === null && nullable) return value;
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new AdapterError(
      `${name} must be an object`,
      ErrorCode.INVALID_PARAMS,
      { name, type: typeof value },
    );
  }
  return value;
}

export function validateArray(
  value,
  name = "value",
  { minLength = 0, itemValidator = null } = {},
) {
  if (!Array.isArray(value)) {
    throw new AdapterError(
      `${name} must be an array`,
      ErrorCode.INVALID_PARAMS,
      { name, type: typeof value },
    );
  }
  if (value.length < minLength) {
    throw new AdapterError(
      `${name} must have at least ${minLength} items`,
      ErrorCode.INVALID_PARAMS,
      { name, length: value.length, minLength },
    );
  }
  if (itemValidator) {
    value.forEach((item, index) => itemValidator(item, `${name}[${index}]`));
  }
  return value;
}

export function validateUrl(
  value,
  name = "url",
  { allowedProtocols = ["http:", "https:"] } = {},
) {
  validateString(value, name);

  try {
    const url = new URL(value);
    if (!allowedProtocols.includes(url.protocol)) {
      throw new AdapterError(
        `${name} must use one of protocols: ${allowedProtocols.join(", ")}`,
        ErrorCode.INVALID_PARAMS,
        { name, protocol: url.protocol },
      );
    }
    return url.href;
  } catch (e) {
    if (e instanceof AdapterError) throw e;
    throw new AdapterError(
      `${name} must be a valid URL`,
      ErrorCode.INVALID_PARAMS,
      { name, value },
    );
  }
}

export function validateEnum(value, allowedValues, name = "value") {
  if (!allowedValues.includes(value)) {
    throw new AdapterError(
      `${name} must be one of: ${allowedValues.join(", ")}`,
      ErrorCode.INVALID_PARAMS,
      { name, value, allowedValues },
    );
  }
  return value;
}

export function validateOptional(value, validator, name = "value") {
  if (value === undefined || value === null) return value;
  return validator(value, name);
}

export function safeString(value, name = "value") {
  try {
    return validateString(value, name);
  } catch (e) {
    return "";
  }
}

export function safeUrl(value, name = "url", fallback = "#") {
  try {
    return validateUrl(value, name);
  } catch (e) {
    return fallback;
  }
}

export function safeNumber(value, name = "value", fallback = 0, options = {}) {
  try {
    return validateNumber(value, name, options);
  } catch (e) {
    return fallback;
  }
}

export function sanitizeFileName(filename) {
  if (!filename || typeof filename !== "string") return "untitled";
  return filename
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9-_\.]/g, "_")
    .slice(0, 200);
}

export function sanitizePath(path) {
  if (!path || typeof path !== "string") return "";
  return path
    .replace(/\.\.+/g, ".")
    .replace(/[\\]+/g, "/")
    .replace(/\/+/g, "/");
}

export const Validator = {
  validateString,
  validateNumber,
  validateBoolean,
  validateObject,
  validateArray,
  validateUrl,
  validateEnum,
  validateOptional,
  safeString,
  safeUrl,
  safeNumber,
  sanitizeFileName,
  sanitizePath,
};

export default Validator;
