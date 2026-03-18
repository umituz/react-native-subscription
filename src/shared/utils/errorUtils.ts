/**
 * Centralized error handling utilities.
 *
 * Benefits:
 * - Removes 45+ duplicated error handling blocks
 * - Consistent error logging everywhere
 * - Easier debugging with better error context
 * - Type-safe error handling
 */

import { logError } from "./logger";

/**
 * Safely convert unknown error to Error object.
 * Useful when catching errors from external APIs.
 */
export function toError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === "string") {
    return new Error(error);
  }

  if (error === null || error === undefined) {
    return new Error("Unknown error occurred");
  }

  try {
    return new Error(JSON.stringify(error));
  } catch {
    return new Error(String(error));
  }
}

/**
 * Create an error with a code and optional cause.
 * Wraps the BaseError pattern for convenience.
 */
export function createError(
  message: string,
  code: string,
  cause?: Error
): Error {
  const error = new Error(message);
  error.name = code;

  if (cause) {
    // @ts-ignore - adding cause property
    error.cause = cause;
  }

  return error;
}

/**
 * Log an error with consistent formatting.
 * Only logs in __DEV__ mode.
 */
export function logAndReturnError(
  tag: string,
  message: string,
  error: unknown,
  context?: Record<string, unknown>
): Error {
  const normalizedError = toError(error);

  if (typeof __DEV__ !== "undefined" && __DEV__) {
    logError(tag, message, normalizedError, {
      ...context,
      originalError: error,
    });
  }

  return normalizedError;
}

/**
 * Type guard to check if value is an Error.
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

/**
 * Type guard to check if error has a code property.
 */
export function isErrorWithCode(error: Error): error is Error & { code: string } {
  return "code" in error && typeof error.code === "string";
}

/**
 * Type guard to check if error has a cause property.
 */
export function isErrorWithCause(error: Error): error is Error & { cause: Error } {
  return "cause" in error && error.cause instanceof Error;
}

/**
 * Wrap an async function with error handling.
 * Returns a Result type with success/error states.
 */
export async function tryAsync<T>(
  fn: () => Promise<T>,
  context: { tag: string; operation: string }
): Promise<{ success: true; data: T } | { success: false; error: Error }> {
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
): { success: true; data: T } | { success: false; error: Error } {
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

/**
 * Create a Firestore-specific error with consistent formatting.
 */
export function createFirestoreError(
  operation: string,
  error: unknown
): Error {
  return createError(
    `Firestore ${operation} failed`,
    "FIRESTORE_ERROR",
    toError(error)
  );
}

/**
 * Create a RevenueCat-specific error with consistent formatting.
 */
export function createRevenueCatError(
  operation: string,
  error: unknown
): Error {
  return createError(
    `RevenueCat ${operation} failed`,
    "REVENUECAT_ERROR",
    toError(error)
  );
}
