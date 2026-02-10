/**
 * Number Utilities - Formatting
 * Number formatting and display functions
 */

/**
 * Format number with thousands separator
 */
export function formatNumber(value: number, locale: string = "en-US"): string {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Format number as compact string (e.g., 1K, 1M, 1B)
 */
export function formatCompactNumber(value: number, locale: string = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    compactDisplay: "short",
  }).format(value);
}

/**
 * Round to nearest multiple (e.g., round to nearest 0.99)
 */
export function roundToNearest(value: number, multiple: number): number {
  return Math.round(value / multiple) * multiple;
}

/**
 * Floor to nearest multiple
 */
export function floorToNearest(value: number, multiple: number): number {
  return Math.floor(value / multiple) * multiple;
}

/**
 * Ceiling to nearest multiple
 */
export function ceilToNearest(value: number, multiple: number): number {
  return Math.ceil(value / multiple) * multiple;
}
