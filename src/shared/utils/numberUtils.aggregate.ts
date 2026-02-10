/**
 * Number Utilities - Aggregation
 * Array aggregation functions for numbers
 */

/**
 * Calculate the sum of an array of numbers
 */
export function sum(values: number[]): number {
  return values.reduce((acc, val) => acc + val, 0);
}

/**
 * Calculate the average of an array of numbers
 */
export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return sum(values) / values.length;
}

/**
 * Find the minimum value in an array
 */
export function min(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.min(...values);
}

/**
 * Find the maximum value in an array
 */
export function max(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.max(...values);
}
