/**
 * Result Utilities
 * Shared helpers for working with Result pattern
 */

import type { Result } from "../../utils/Result";
import { failure } from "../../utils/Result";

interface ApiError {
  message: string;
  code: string;
}

/**
 * Create a standard error result
 */
function createErrorResult(
  message: string,
  code: string = "UNKNOWN_ERROR"
): Result<never, ApiError> {
  return failure({ message, code });
}

/**
 * Map Error to ApiError result
 */
export function mapErrorToResult<T>(error: unknown): Result<T, ApiError> {
  const message = error instanceof Error ? error.message : "An unknown error occurred";
  const code = error instanceof Error && "code" in error ? String(error.code) : "UNKNOWN_ERROR";
  return createErrorResult(message, code);
}

