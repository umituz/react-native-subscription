/**
 * String Utilities - Formatting
 * String formatting and display functions
 */

/**
 * Truncate string to specified length and add ellipsis
 */
export function truncate(str: string, maxLength: number, suffix: string = "..."): string {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Format bytes as human readable string
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Format a list of items as a comma-separated string with "and" for the last item
 */
export function formatList(items: string[], conjunction: string = "and"): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0] ?? "";
  if (items.length === 2) return items.join(` ${conjunction} `);

  const lastItem = items[items.length - 1];
  return `${items.slice(0, -1).join(", ")} ${conjunction} ${lastItem ?? ""}`;
}

/**
 * Pluralize a word based on count
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return singular;
  return plural || singular + "s";
}

/**
 * Format number as ordinal (1st, 2nd, 3rd, etc.)
 */
export function formatOrdinal(num: number): string {
  const suffixes = ["th", "st", "nd", "rd"];
  const value = num % 100;
  const suffix = suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0];
  return `${num}${suffix}`;
}

/**
 * Mask sensitive data (e.g., credit card, email)
 */
export function maskString(str: string, visibleChars: number = 4, maskChar: string = "*"): string {
  if (!str) return "";
  if (str.length <= visibleChars * 2) return maskChar.repeat(str.length);

  const start = str.substring(0, visibleChars);
  const end = str.substring(str.length - visibleChars);
  const middleLength = str.length - visibleChars * 2;

  return `${start}${maskChar.repeat(middleLength)}${end}`;
}

/**
 * Extract initials from a name
 */
export function getInitials(name: string, maxInitials: number = 2): string {
  if (!name) return "";
  return name
    .split(" ")
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, maxInitials)
    .join("");
}
