import { isDefined } from "../../../shared/utils/validators";

export function isAuthenticated(userId: string | null | undefined): userId is string {
  return isDefined(userId) && userId.length > 0;
}

/**
 * Requires user to be authenticated, throws if not
 * Type guard that asserts userId is string
 *
 * @param userId - User ID to check
 * @param errorMessage - Custom error message (optional)
 * @throws Error if user is not authenticated
 *
 * @example
 * function purchaseProduct(userId: string | null) {
 *   requireAuthentication(userId); // throws if null/undefined
 *   // TypeScript now knows userId is string
 *   await purchase(userId);
 * }
 */
export function requireAuthentication(
  userId: string | null | undefined,
  errorMessage = "User not authenticated"
): asserts userId is string {
  if (!isAuthenticated(userId)) {
    throw new Error(errorMessage);
  }
}
