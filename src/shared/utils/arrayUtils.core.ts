/**
 * Array Utilities - Core Operations
 * Basic array manipulation functions
 */

/**
 * Check if array is empty
 */
export function isEmpty<T>(arr: readonly T[] | null | undefined): boolean {
  return !arr || arr.length === 0;
}

/**
 * Check if array has elements
 */
export function isNotEmpty<T>(arr: readonly T[] | null | undefined): boolean {
  return !isEmpty(arr);
}

/**
 * Get first element of array or null
 */
export function first<T>(arr: readonly T[] | null | undefined): T | null {
  if (!arr || arr.length === 0) return null;
  return arr[0] ?? null;
}

/**
 * Get last element of array or null
 */
export function last<T>(arr: readonly T[] | null | undefined): T | null {
  if (!arr || arr.length === 0) return null;
  return arr[arr.length - 1] ?? null;
}

/**
 * Get nth element of array or null
 */
export function nth<T>(arr: readonly T[], index: number): T | null {
  if (index < 0) index = arr.length + index;
  if (index < 0 || index >= arr.length) return null;
  return arr[index] ?? null;
}

/**
 * Remove first element from array
 */
export function removeFirst<T>(arr: T[]): T[] {
  return arr.slice(1);
}

/**
 * Remove last element from array
 */
export function removeLast<T>(arr: T[]): T[] {
  return arr.slice(0, -1);
}

/**
 * Remove element at index
 */
export function removeAt<T>(arr: readonly T[], index: number): T[] {
  return arr.filter((_, i) => i !== index);
}

/**
 * Remove elements that match a predicate
 */
export function removeWhere<T>(
  arr: readonly T[],
  predicate: (item: T, index: number) => boolean
): T[] {
  return arr.filter((item, index) => !predicate(item, index));
}

/**
 * Unique array elements (removes duplicates)
 */
export function unique<T>(arr: readonly T[]): T[] {
  return Array.from(new Set(arr));
}
