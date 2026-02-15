/**
 * Error Utilities
 * Common error handling and normalization functions
 */

/**
 * Normalizes unknown error types to Error objects
 * Useful for catch blocks where error type is unknown
 *
 * @param error - The error to normalize (unknown type)
 * @param fallbackMessage - Message to use if error is not an Error object
 * @returns Always returns an Error object
 *
 * @example
 * try {
 *   await someOperation();
 * } catch (error) {
 *   const err = normalizeError(error, "Operation failed");
 *   console.error(err.message);
 * }
 */
export function normalizeError(
  error: unknown,
  fallbackMessage = "Unknown error"
): Error {
  if (error instanceof Error) {
    return error;
  }

  const message = typeof error === "string" ? error : String(error);
  return new Error(message || fallbackMessage);
}
