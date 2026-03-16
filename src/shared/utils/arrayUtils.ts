/**
 * Array validation and utility functions
 */

/**
 * Check if array has items
 */
export function hasItems<T>(arr: readonly T[] | T[] | null | undefined): boolean {
  return Array.isArray(arr) && arr.length > 0;
}

/**
 * Check if array is empty
 */
export function isEmptyArray<T>(arr: readonly T[] | T[] | null | undefined): boolean {
  return !Array.isArray(arr) || arr.length === 0;
}

/**
 * Get array length safely (returns 0 for null/undefined)
 */
export function getArrayLength<T>(arr: T[] | null | undefined): number {
  return Array.isArray(arr) ? arr.length : 0;
}

/**
 * Find item in array by predicate
 */
export function findItem<T>(
  arr: T[] | null | undefined,
  predicate: (item: T) => boolean
): T | undefined {
  if (!Array.isArray(arr)) return undefined;
  return arr.find(predicate);
}

/**
 * Filter array by predicate
 */
export function filterItems<T>(
  arr: T[] | null | undefined,
  predicate: (item: T) => boolean
): T[] {
  if (!Array.isArray(arr)) return [];
  return arr.filter(predicate);
}

/**
 * Map array safely (returns empty array for null/undefined)
 */
export function mapItems<T, R>(
  arr: T[] | null | undefined,
  mapper: (item: T) => R
): R[] {
  if (!Array.isArray(arr)) return [];
  return arr.map(mapper);
}

/**
 * Check if array contains item
 */
export function arrayContains<T>(arr: T[] | null | undefined, item: T): boolean {
  if (!Array.isArray(arr)) return false;
  return arr.includes(item);
}
