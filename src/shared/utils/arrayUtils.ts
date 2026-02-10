/**
 * Array Utilities
 * Re-exports all array utility modules
 */

export * from "./arrayUtils.core";
export * from "./arrayUtils.transforms";
export * from "./arrayUtils.query";

/**
 * Create an array of numbers from start to end (inclusive)
 */
export function range(start: number, end: number, step: number = 1): number[] {
  const result: number[] = [];
  for (let i = start; step > 0 ? i <= end : i >= end; i += step) {
    result.push(i);
  }
  return result;
}
