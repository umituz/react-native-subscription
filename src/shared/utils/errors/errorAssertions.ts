/**
 * Error Assertion Functions
 *
 * Runtime validation and type narrowing utilities.
 * Throws errors with consistent formatting.
 */

import { createError } from "./errorConversion";

/**
 * Assert that a condition is true, throw error otherwise.
 * Useful for validation and runtime checks.
 */
export function assert(
  condition: boolean,
  message: string,
  code: string = "ASSERTION_ERROR"
): asserts condition {
  if (!condition) {
    throw createError(message, code);
  }
}

/**
 * Assert that a value is not null/undefined.
 * Throws error if value is null/undefined, returns value otherwise.
 * Useful for type narrowing.
 */
export function assertNotNil<T>(
  value: T | null | undefined,
  message: string = "Value should not be null or undefined"
): T {
  assert(value !== null && value !== undefined, message, "NOT_NIL_ERROR");
  return value;
}
