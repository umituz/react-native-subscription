/**
 * User Tier Validation Utilities
 *
 * Type guards and validation functions for user tier system
 */

import type { UserTier, UserTierInfo } from './types';

export function isValidUserTier(value: unknown): value is UserTier {
  return value === 'guest' || value === 'freemium' || value === 'premium';
}

export function isUserTierInfo(value: unknown): value is UserTierInfo {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    isValidUserTier(obj.tier) &&
    typeof obj.isPremium === 'boolean' &&
    typeof obj.isGuest === 'boolean' &&
    typeof obj.isAuthenticated === 'boolean' &&
    (obj.userId === null || typeof obj.userId === 'string')
  );
}