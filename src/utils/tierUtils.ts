/**
 * User Tier Core Utilities
 *
 * Core logic for determining user tier and premium status
 */

import { validateIsGuest, validateUserId, validateIsPremium } from './validation';
import type { UserTierInfo } from './types';

/**
 * Determine user tier from auth state and premium status
 * 
 * This is the SINGLE SOURCE OF TRUTH for tier determination.
 * All apps should use this function for consistent tier logic.
 *
 * @param isGuest - Whether user is a guest
 * @param userId - User ID (null for guests)
 * @param isPremium - Whether user has active premium subscription
 * @returns User tier information
 * 
 * @example
 * ```typescript
 * const tierInfo = getUserTierInfo(false, 'user123', true);
 * // Returns: { tier: 'premium', isPremium: true, isGuest: false, isAuthenticated: true, userId: 'user123' }
 * 
 * const guestInfo = getUserTierInfo(true, null, false);
 * // Returns: { tier: 'guest', isPremium: false, isGuest: true, isAuthenticated: false, userId: null }
 * ```
 */
export function getUserTierInfo(
  isGuestFlag: boolean,
  userId: string | null,
  isPremium: boolean,
): UserTierInfo {
  validateIsGuest(isGuestFlag);
  validateUserId(userId);
  validateIsPremium(isPremium);

  // Guest users are always freemium, never premium
  if (isGuestFlag || userId === null) {
    return {
      tier: 'guest',
      isPremium: false,
      isGuest: true,
      isAuthenticated: false,
      userId: null,
    };
  }

  // Authenticated users: premium or freemium
  return {
    tier: isPremium ? 'premium' : 'freemium',
    isPremium,
    isGuest: false,
    isAuthenticated: true,
    userId,
  };
}

/**
 * Check if user has premium access (synchronous version)
 * 
 * Guest users NEVER have premium access, regardless of isPremium value.
 *
 * @param isGuest - Whether user is a guest
 * @param userId - User ID (null for guests)
 * @param isPremium - Whether user has active premium subscription
 * @returns Whether user has premium access
 * 
 * @example
 * ```typescript
 * // Guest user - always false
 * checkPremiumAccess(true, null, true); // false
 * 
 * // Authenticated premium user
 * checkPremiumAccess(false, 'user123', true); // true
 * 
 * // Authenticated freemium user
 * checkPremiumAccess(false, 'user123', false); // false
 * ```
 */
export function checkPremiumAccess(
  isGuestFlag: boolean,
  userId: string | null,
  isPremium: boolean,
): boolean {
  validateIsGuest(isGuestFlag);
  validateUserId(userId);
  validateIsPremium(isPremium);

  // Guest users never have premium access
  if (isGuestFlag || userId === null) {
    return false;
  }

  return isPremium;
}