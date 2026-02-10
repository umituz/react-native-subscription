/**
 * Shared Validation Utilities
 * Common validation functions and type guards
 */

/**
 * Check if value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Check if value is a valid number (not NaN or Infinity)
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === "number" && !isNaN(value) && isFinite(value);
}

/**
 * Check if value is a positive number
 */
export function isPositiveNumber(value: unknown): value is number {
  return isValidNumber(value) && value > 0;
}

/**
 * Check if value is a non-negative number
 */
export function isNonNegativeNumber(value: unknown): value is number {
  return isValidNumber(value) && value >= 0;
}

/**
 * Check if value is a valid integer
 */
export function isInteger(value: unknown): value is number {
  return isValidNumber(value) && Number.isInteger(value);
}

/**
 * Check if value is a valid date
 */
export function isValidDate(value: unknown): boolean {
  if (value instanceof Date) {
    return !isNaN(value.getTime());
  }
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    return !isNaN(d.getTime());
  }
  return false;
}

/**
 * Check if value is a valid email (basic validation)
 */
export function isValidEmail(value: unknown): value is string {
  if (!isNonEmptyString(value)) {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * Check if value is a valid URL (basic validation)
 */
export function isValidUrl(value: unknown): value is string {
  if (!isNonEmptyString(value)) {
    return false;
  }
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if value is within a numeric range (type guard version)
 */
export function isValueInRange(
  value: unknown,
  min: number,
  max: number,
  inclusive: boolean = true
): value is number {
  if (!isValidNumber(value)) {
    return false;
  }
  if (inclusive) {
    return value >= min && value <= max;
  }
  return value > min && value < max;
}

/**
 * Check if array has at least one element
 */
export function isNonEmptyArray<T>(value: unknown): value is [T, ...T[]] {
  return Array.isArray(value) && value.length > 0;
}

/**
 * Check if value is a plain object (not null, not array)
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Check if value is defined (not null or undefined)
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Validate that a number is within credit limits
 */
export function isValidCreditAmount(value: unknown): value is number {
  return isInteger(value) && isNonNegativeNumber(value);
}

/**
 * Validate that a price is valid (positive number with max 2 decimal places)
 */
export function isValidPrice(value: unknown): value is number {
  if (!isPositiveNumber(value)) {
    return false;
  }
  // Check for max 2 decimal places
  const decimalPlaces = (value.toString().split(".")[1] || "").length;
  return decimalPlaces <= 2;
}

/**
 * Check if a string is a valid product identifier
 */
export function isValidProductId(value: unknown): value is string {
  return isNonEmptyString(value) && /^[a-zA-Z0-9._-]+$/.test(value);
}

/**
 * Check if value is a valid user ID
 */
export function isValidUserId(value: unknown): value is string {
  return isNonEmptyString(value) && value.length > 0;
}

/**
 * Sanitize string input (trim and remove extra whitespace)
 */
export function sanitizeString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "string") {
    return value.trim().replace(/\s+/g, " ");
  }
  return String(value).trim().replace(/\s+/g, " ");
}

/**
 * Validate and sanitize a number input
 */
export function sanitizeNumber(
  value: unknown,
  defaultValue: number = 0
): number {
  if (isValidNumber(value)) {
    return value;
  }
  return defaultValue;
}

/**
 * Check if a value is within an allowed set of values
 */
export function isOneOf<T>(
  value: unknown,
  allowedValues: readonly T[]
): value is T {
  return allowedValues.includes(value as T);
}
