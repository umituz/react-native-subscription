/**
 * User Tier Validation Utilities
 *
 * Type guards and validation functions for user tier system
 */

import type { UserTier, UserTierInfo } from './types';

/**
 * Type guard to check if a value is a valid UserTier
 * 
 * @param value - Value to check
 * @returns Whether value is a valid UserTier
 * 
 * @example
 * ```typescript
 * if (isValidUserTier(someValue)) {
 *   // TypeScript knows someValue is UserTier
 * }
 * ```
 */
export function isValidUserTier(value: unknown): value is UserTier {
  return value === 'guest' || value === 'freemium' || value === 'premium';
}

/**
 * Type guard to check if an object is a valid UserTierInfo
 * 
 * @param value - Value to check
 * @returns Whether value is a valid UserTierInfo
 * 
 * @example
 * ```typescript
 * if (isUserTierInfo(someValue)) {
 *   // TypeScript knows someValue is UserTierInfo
 * }
 * ```
 */
export function isUserTierInfo(value: unknown): value is UserTierInfo {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return (
    isValidUserTier(obj.tier) &&
    typeof obj.isPremium === 'boolean' &&
    typeof obj.isGuest === 'boolean' &&
    typeof obj.isAuthenticated === 'boolean' &&
    (obj.userId === null || typeof obj.userId === 'string')
  );
}

/**
 * Validate userId parameter
 * 
 * @param userId - User ID to validate
 * @throws {TypeError} If userId is invalid
 */
export function validateUserId(userId: string | null): void {
  if (userId !== null && typeof userId !== 'string') {
    throw new TypeError(
      `Invalid userId: expected string or null, got ${typeof userId}`
    );
  }

  if (userId !== null && userId.trim() === '') {
    throw new TypeError('Invalid userId: cannot be empty string');
  }
}

/**
 * Validate isGuest parameter
 * 
 * @param isGuest - isGuest flag to validate
 * @throws {TypeError} If isGuest is invalid
 */
export function validateIsGuest(isGuest: boolean): void {
  if (typeof isGuest !== 'boolean') {
    throw new TypeError(
      `Invalid isGuest: expected boolean, got ${typeof isGuest}`
    );
  }
}

/**
 * Validate isPremium parameter
 * 
 * @param isPremium - isPremium flag to validate
 * @throws {TypeError} If isPremium is invalid
 */
export function validateIsPremium(isPremium: boolean): void {
  if (typeof isPremium !== 'boolean') {
    throw new TypeError(
      `Invalid isPremium: expected boolean, got ${typeof isPremium}`
    );
  }
}

/**
 * Validate PremiumStatusFetcher
 * 
 * @param fetcher - Fetcher to validate
 * @throws {TypeError} If fetcher is invalid
 */
export function validateFetcher(fetcher: import('./types').PremiumStatusFetcher): void {
  if (typeof fetcher !== 'object' || fetcher === null) {
    throw new TypeError(
      `Invalid fetcher: expected object, got ${typeof fetcher}`
    );
  }

  if (typeof fetcher.isPremium !== 'function') {
    throw new TypeError(
      'Invalid fetcher: isPremium must be a function'
    );
  }
}