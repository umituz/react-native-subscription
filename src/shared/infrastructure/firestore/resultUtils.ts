/**
 * Result Utilities
 * Shared helpers for working with Result pattern
 */

import type { Result } from "../../utils/Result";
import { failure, success } from "../../utils/Result";

export interface ApiError {
  message: string;
  code: string;
}

/**
 * Create a standard error result
 */
export function createErrorResult(
  message: string,
  code: string = "UNKNOWN_ERROR"
): Result<never, ApiError> {
  return failure({ message, code });
}

/**
 * Create a database unavailable error result
 */
export function createDbUnavailableResult<T>(): Result<T, ApiError> {
  return createErrorResult("Database not available", "DB_NOT_AVAILABLE");
}

/**
 * Map Error to ApiError result
 */
export function mapErrorToResult<T>(error: unknown): Result<T, ApiError> {
  const message = error instanceof Error ? error.message : "An unknown error occurred";
  const code = error instanceof Error && "code" in error ? String(error.code) : "UNKNOWN_ERROR";
  return createErrorResult(message, code);
}

/**
 * Execute async function and return Result
 */
export async function executeAsResult<T>(
  fn: () => Promise<T>
): Promise<Result<T, ApiError>> {
  try {
    const data = await fn();
    return success(data);
  } catch (error) {
    return mapErrorToResult<T>(error);
  }
}

/**
 * Validate database availability before executing
 */
export async function withDbCheck<T>(
  fn: (db: any) => Promise<T>
): Promise<Result<T, ApiError>> {
  const { requireFirestore } = require("./collectionUtils");

  try {
    const db = requireFirestore();
    return await executeAsResult(() => fn(db));
  } catch (error) {
    return mapErrorToResult<T>(error);
  }
}
