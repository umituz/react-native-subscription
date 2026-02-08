/**
 * User Tier Validation Utilities
 *
 * Type guards and validation functions for user tier system
 */

import { USER_TIER, type UserTier, type UserTierInfo } from './types';

export function isValidUserTier(value: unknown): value is UserTier {
  return value === USER_TIER.ANONYMOUS || value === USER_TIER.FREEMIUM || value === USER_TIER.PREMIUM;
}

export function isUserTierInfo(value: unknown): value is UserTierInfo {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    isValidUserTier(obj.tier) &&
    typeof obj.isPremium === 'boolean' &&
    typeof obj.isAnonymous === 'boolean' &&
    typeof obj.isAuthenticated === 'boolean' &&
    (obj.userId === null || typeof obj.userId === 'string')
  );
}