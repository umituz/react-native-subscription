/**
 * String Utilities - Modify Operations
 * String manipulation and transformation functions
 */

/**
 * Remove all whitespace from string
 */
export function removeWhitespace(str: string): string {
  return str.replace(/\s+/g, "");
}

/**
 * Normalize whitespace (replace multiple spaces with single space)
 */
export function normalizeWhitespace(str: string): string {
  return str.trim().replace(/\s+/g, " ");
}

/**
 * Count words in a string
 */
export function countWords(str: string): number {
  if (!str.trim()) return 0;
  return str.trim().split(/\s+/).length;
}

/**
 * Count characters in a string (excluding whitespace)
 */
export function countChars(str: string, excludeWhitespace: boolean = true): number {
  return excludeWhitespace ? removeWhitespace(str).length : str.length;
}

/**
 * Replace all occurrences of a substring
 */
export function replaceAll(str: string, search: string, replacement: string): string {
  return str.split(search).join(replacement);
}

/**
 * Escape special regex characters in a string
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Strip HTML tags from a string
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

/**
 * Sanitize string input (trim and remove extra whitespace)
 */
export function sanitizeStringValue(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "string") {
    return value.trim().replace(/\s+/g, " ");
  }
  return String(value).trim().replace(/\s+/g, " ");
}
