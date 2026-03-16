/**
 * String validation and utility functions
 */

/**
 * Check if string is not empty
 */
export function isNonEmptyString(str: string | null | undefined): boolean {
  return typeof str === "string" && str.length > 0;
}

/**
 * Check if string is empty
 */
export function isEmptyString(str: string | null | undefined): boolean {
  return !isNonEmptyString(str);
}

/**
 * Trim string and check if not empty
 */
export function isNonEmptyAfterTrim(str: string | null | undefined): boolean {
  if (typeof str !== "string") return false;
  return str.trim().length > 0;
}

/**
 * Get trimmed string or empty string
 */
export function getTrimmedString(str: string | null | undefined): string {
  if (typeof str !== "string") return "";
  return str.trim();
}

/**
 * Check if string equals one of the values
 */
export function stringEqualsAny(
  str: string | null | undefined,
  values: string[]
): boolean {
  if (typeof str !== "string") return false;
  return values.includes(str);
}

/**
 * Check if string contains substring
 */
export function stringContains(
  str: string | null | undefined,
  substring: string
): boolean {
  if (typeof str !== "string") return false;
  return str.includes(substring);
}

/**
 * Check if string is neither 'undefined' nor 'null' string
 */
export function isValidString(str: string | null | undefined): boolean {
  if (typeof str !== "string") return false;
  const trimmed = str.trim();
  return trimmed.length > 0 && trimmed !== "undefined" && trimmed !== "null";
}
