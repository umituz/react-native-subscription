/**
 * Number Utilities - Core Operations
 * Basic numeric calculation functions
 */

/**
 * Clamp a number between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Round a number to specified decimal places
 */
export function roundTo(value: number, decimals: number = 2): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

/**
 * Calculate percentage and clamp between 0-100
 */
export function calculatePercentageClamped(value: number, total: number): number {
  return clamp(calculatePercentage(value, total), 0, 100);
}

/**
 * Check if two numbers are approximately equal (within epsilon)
 */
export function isApproximatelyEqual(a: number, b: number, epsilon: number = 0.0001): boolean {
  return Math.abs(a - b) < epsilon;
}

/**
 * Safe division that returns 0 instead of NaN
 */
export function safeDivide(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return numerator / denominator;
}

/**
 * Calculate remaining value after subtraction with floor at 0
 */
export function calculateRemaining(current: number, cost: number): number {
  return Math.max(0, current - cost);
}

/**
 * Check if user can afford a cost
 */
export function canAfford(balance: number | null | undefined, cost: number): boolean {
  if (balance === null || balance === undefined || cost < 0) return false;
  return balance >= cost;
}

/**
 * Calculate credit percentage for UI display
 */
export function calculateCreditPercentage(current: number | null | undefined, max: number): number {
  if (current === null || current === undefined || max <= 0) return 0;
  return calculatePercentageClamped(current, max);
}
