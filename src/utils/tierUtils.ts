/**
 * User Tier Core Utilities
 *
 * Core logic for determining user tier and premium status
 */

import type { UserTierInfo } from './types';


export function getUserTierInfo(
  isAnonymous: boolean,
  userId: string | null,
  isPremium: boolean,
): UserTierInfo {
  if (isAnonymous || userId === null) {
    return {
      tier: 'anonymous',
      isPremium: false,
      isAnonymous: true,
      isAuthenticated: false,
      userId: null,
    };
  }

  return {
    tier: isPremium ? 'premium' : 'freemium',
    isPremium,
    isAnonymous: false,
    isAuthenticated: true,
    userId,
  };
}

export function checkPremiumAccess(
  isAnonymous: boolean,
  userId: string | null,
  isPremium: boolean,
): boolean {
  if (isAnonymous || userId === null) return false;
  return isPremium;
}