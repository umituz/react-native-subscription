/**
 * Array Utilities - Transformations
 * Array transformation and manipulation functions
 */

/**
 * Chunk array into smaller arrays of specified size
 */
export function chunk<T>(arr: readonly T[], size: number): T[][] {
  if (size <= 0) return [];
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

/**
 * Flatten array one level deep
 */
export function flatten<T>(arr: readonly (readonly T[] | T)[]): T[] {
  const result: T[] = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(...item);
    } else if (item !== undefined) {
      result.push(item as T);
    }
  }
  return result;
}

/**
 * Flatten array recursively
 */
export function flattenDeep<T>(arr: readonly unknown[]): T[] {
  const result: T[] = [];
  const stack = [...arr];

  while (stack.length > 0) {
    const item = stack.shift();
    if (Array.isArray(item)) {
      stack.unshift(...item);
    } else if (item !== undefined) {
      result.push(item as T);
    }
  }

  return result;
}

/**
 * Zip two arrays together
 */
export function zip<T, U>(arr1: readonly T[], arr2: readonly U[]): [T, U][] {
  const length = Math.min(arr1.length, arr2.length);
  const result: [T, U][] = [];
  for (let i = 0; i < length; i++) {
    result.push([arr1[i]!, arr2[i]!]);
  }
  return result;
}

/**
 * Partition array into two arrays based on predicate
 */
export function partition<T>(
  arr: readonly T[],
  predicate: (item: T, index: number) => boolean
): [T[], T[]] {
  const truthy: T[] = [];
  const falsy: T[] = [];

  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    if (item !== undefined) {
      if (predicate(item, i)) {
        truthy.push(item);
      } else {
        falsy.push(item);
      }
    }
  }

  return [truthy, falsy];
}

/**
 * Move element from one index to another
 */
export function move<T>(arr: readonly T[], from: number, to: number): T[] {
  if (from < 0 || from >= arr.length || to < 0 || to >= arr.length) {
    return [...arr];
  }
  const result = [...arr];
  const element = result[from];
  if (element === undefined) return result;

  result.splice(from, 1);
  result.splice(to, 0, element);
  return result;
}

/**
 * Swap two elements in array
 */
export function swap<T>(arr: readonly T[], index1: number, index2: number): T[] {
  if (index1 < 0 || index1 >= arr.length || index2 < 0 || index2 >= arr.length) {
    return [...arr];
  }
  const result = [...arr];
  const temp = result[index1];
  result[index1] = result[index2]!;
  result[index2] = temp!;
  return result;
}
