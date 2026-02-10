/**
 * String Utilities - Generate Functions
 * String generation and encoding functions
 */

/**
 * Generate a random string of specified length
 */
export function randomString(
  length: number,
  charset: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

/**
 * Generate a random ID
 */
export function randomId(prefix: string = ""): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`;
}

/**
 * Convert a string to base64
 */
export function toBase64(str: string): string {
  if (typeof btoa !== "undefined") {
    return btoa(str);
  }
  return Buffer.from(str).toString("base64");
}

/**
 * Decode a base64 string
 */
export function fromBase64(base64: string): string {
  if (typeof atob !== "undefined") {
    return atob(base64);
  }
  return Buffer.from(base64, "base64").toString();
}
