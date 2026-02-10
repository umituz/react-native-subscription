/**
 * Array Utilities - Query Operations
 * Array searching, filtering, and grouping functions
 */

/**
 * Group array elements by a key function
 */
export function groupBy<T, K extends string | number | symbol>(
  arr: readonly T[],
  keyFn: (item: T, index: number) => K
): Record<K, T[]> {
  return arr.reduce((result, item, index) => {
    const key = keyFn(item, index);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {} as Record<K, T[]>);
}

/**
 * Unique array elements by a key function
 */
export function uniqueBy<T, K>(arr: readonly T[], keyFn: (item: T) => K): T[] {
  const seen = new Set<K>();
  return arr.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Shuffle array (Fisher-Yates algorithm)
 */
export function shuffle<T>(arr: readonly T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i]!;
    result[i] = result[j]!;
    result[j] = temp;
  }
  return result;
}

/**
 * Sort array by a key function
 */
export function sortBy<T>(
  arr: readonly T[],
  keyFn: (item: T) => string | number,
  order: "asc" | "desc" = "asc"
): T[] {
  return [...arr].sort((a, b) => {
    const keyA = keyFn(a);
    const keyB = keyFn(b);
    if (keyA < keyB) return order === "asc" ? -1 : 1;
    if (keyA > keyB) return order === "asc" ? 1 : -1;
    return 0;
  });
}

/**
 * Pick random element(s) from array
 */
export function sample<T>(arr: readonly T[], count: number = 1): T[] {
  if (arr.length === 0) return [];
  const shuffled = shuffle([...arr]);
  return shuffled.slice(0, Math.min(count, arr.length));
}

/**
 * Find intersection of two arrays
 */
export function intersection<T>(arr1: readonly T[], arr2: readonly T[]): T[] {
  const set2 = new Set(arr2);
  return arr1.filter((item) => set2.has(item));
}

/**
 * Find difference of two arrays (elements in arr1 but not in arr2)
 */
export function difference<T>(arr1: readonly T[], arr2: readonly T[]): T[] {
  const set2 = new Set(arr2);
  return arr1.filter((item) => !set2.has(item));
}

/**
 * Find symmetric difference of two arrays (elements in either array but not both)
 */
export function symmetricDifference<T>(arr1: readonly T[], arr2: readonly T[]): T[] {
  const set1 = new Set(arr1);
  const set2 = new Set(arr2);
  return [
    ...arr1.filter((item) => !set2.has(item)),
    ...arr2.filter((item) => !set1.has(item)),
  ];
}

/**
 * Check if array contains all elements of another array
 */
export function containsAll<T>(arr: readonly T[], values: readonly T[]): boolean {
  const arrSet = new Set(arr);
  return values.every((value) => arrSet.has(value));
}

/**
 * Check if array contains any element of another array
 */
export function containsAny<T>(arr: readonly T[], values: readonly T[]): boolean {
  const arrSet = new Set(arr);
  return values.some((value) => arrSet.has(value));
}
