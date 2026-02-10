/**
 * String Utilities - Check Operations
 * String validation and comparison functions
 */

/**
 * Check if value is a non-empty string
 */
function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Check if string contains a substring (case insensitive)
 */
export function containsIgnoreCase(str: string, search: string): boolean {
  return str.toLowerCase().includes(search.toLowerCase());
}

/**
 * Check if string starts with a prefix (case insensitive)
 */
export function startsWithIgnoreCase(str: string, prefix: string): boolean {
  return str.toLowerCase().startsWith(prefix.toLowerCase());
}

/**
 * Check if string ends with a suffix (case insensitive)
 */
export function endsWithIgnoreCase(str: string, suffix: string): boolean {
  return str.toLowerCase().endsWith(suffix.toLowerCase());
}

/**
 * Check if a string is a valid email (basic validation)
 */
export function isValidEmailString(value: unknown): value is string {
  if (!isNonEmptyString(value)) {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * Check if value is a valid URL (basic validation)
 */
export function isValidUrlString(value: unknown): value is string {
  if (!isNonEmptyString(value)) {
    return false;
  }
  try {
    new URL(value as string);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a string is a valid product identifier
 */
export function isValidProductIdString(value: unknown): value is string {
  return isNonEmptyString(value) && /^[a-zA-Z0-9._-]+$/.test(value as string);
}
