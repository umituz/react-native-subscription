/**
 * Error Type Guards
 *
 * Type-safe error checking utilities.
 * Provides type narrowing for error objects.
 */

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
