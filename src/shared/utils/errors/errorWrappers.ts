/**
 * Error Wrapper Functions
 *
 * Wrap functions with error handling and return Result types.
 * Provides consistent error handling patterns.
 */

import { logAndReturnError } from "./errorConversion";

type Result<T> =
  | { success: true; data: T }
  | { success: false; error: Error };

/**
 * Wrap an async function with error handling.
 * Returns a Result type with success/error states.
 */
export async function tryAsync<T>(
  fn: () => Promise<T>,
  context: { tag: string; operation: string }
): Promise<Result<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    const normalizedError = logAndReturnError(
      context.tag,
      `Failed to ${context.operation}`,
      error
    );
    return { success: false, error: normalizedError };
  }
}

/**
 * Wrap a synchronous function with error handling.
 * Returns a Result type with success/error states.
 */
export function trySync<T>(
  fn: () => T,
  context: { tag: string; operation: string }
): Result<T> {
  try {
    const data = fn();
    return { success: true, data };
  } catch (error) {
    const normalizedError = logAndReturnError(
      context.tag,
      `Failed to ${context.operation}`,
      error
    );
    return { success: false, error: normalizedError };
  }
}
