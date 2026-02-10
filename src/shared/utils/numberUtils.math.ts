/**
 * Number Utilities - Math Operations
 * Advanced mathematical operations
 */

import { clamp } from "./numberUtils.core";

/**
 * Linear interpolation between two values
 */
export function lerp(start: number, end: number, progress: number): number {
  return start + (end - start) * clamp(progress, 0, 1);
}

/**
 * Map a value from one range to another
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  const progress = (value - inMin) / (inMax - inMin);
  return lerp(outMin, outMax, progress);
}

/**
 * Check if a number is within range (inclusive)
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Calculate tax amount
 */
export function calculateTax(subtotal: number, taxRate: number): number {
  return subtotal * (taxRate / 100);
}

/**
 * Calculate total with tax
 */
export function calculateTotalWithTax(subtotal: number, taxRate: number): number {
  return subtotal + calculateTax(subtotal, taxRate);
}
