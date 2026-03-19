/**
 * Error Conversion Utilities
 *
 * Functions to normalize and convert unknown errors to Error objects.
 * Separated for better modularity and testability.
 */

import { logError } from "../logger";

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
