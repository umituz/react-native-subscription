/**
 * Service-Specific Error Creators
 *
 * Consistent error creation for external services.
 * Provides clear error codes and messages.
 */

import { createError, toError } from "./errorConversion";

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
