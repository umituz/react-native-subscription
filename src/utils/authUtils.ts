/**
 * Authentication Utilities
 *
 * Centralized logic for authentication checks
 */

export function isAuthenticated(
  isGuest: boolean,
  userId: string | null,
): boolean {
  return !isGuest && userId !== null;
}

export function isGuest(
  isGuestFlag: boolean,
  userId: string | null,
): boolean {
  return isGuestFlag || userId === null;
}