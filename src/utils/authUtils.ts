/**
 * Authentication Utilities
 *
 * Centralized logic for authentication checks
 */

import { validateIsGuest, validateUserId } from './validation';

/**
 * Check if user is authenticated
 * 
 * This is the SINGLE SOURCE OF TRUTH for authentication check.
 * All apps should use this function for consistent authentication logic.
 *
 * @param isGuest - Whether user is a guest
 * @param userId - User ID (null for guests)
 * @returns Whether user is authenticated
 * 
 * @example
 * ```typescript
 * // Guest user
 * isAuthenticated(true, null); // false
 * 
 * // Authenticated user
 * isAuthenticated(false, 'user123'); // true
 * ```
 */
export function isAuthenticated(
  isGuest: boolean,
  userId: string | null,
): boolean {
  validateIsGuest(isGuest);
  validateUserId(userId);
  
  return !isGuest && userId !== null;
}

/**
 * Check if user is guest
 * 
 * This is the SINGLE SOURCE OF TRUTH for guest check.
 * All apps should use this function for consistent guest logic.
 *
 * @param isGuest - Whether user is a guest
 * @param userId - User ID (null for guests)
 * @returns Whether user is a guest
 * 
 * @example
 * ```typescript
 * // Guest user
 * isGuest(true, null); // true
 * 
 * // Authenticated user
 * isGuest(false, 'user123'); // false
 * ```
 */
export function isGuest(
  isGuestFlag: boolean,
  userId: string | null,
): boolean {
  validateIsGuest(isGuestFlag);
  validateUserId(userId);
  
  return isGuestFlag || userId === null;
}