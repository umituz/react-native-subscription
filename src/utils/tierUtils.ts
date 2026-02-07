/**
 * User Tier Core Utilities
 *
 * Core logic for determining user tier and premium status
 */

import type { UserTierInfo } from './types';
import { isGuest } from './authUtils';

export function getUserTierInfo(
  isGuestFlag: boolean,
  userId: string | null,
  isPremium: boolean,
): UserTierInfo {
  if (isGuest(isGuestFlag, userId)) {
    return {
      tier: 'guest',
      isPremium: false,
      isGuest: true,
      isAuthenticated: false,
      userId: null,
    };
  }

  return {
    tier: isPremium ? 'premium' : 'freemium',
    isPremium,
    isGuest: false,
    isAuthenticated: true,
    userId,
  };
}

export function checkPremiumAccess(
  isGuestFlag: boolean,
  userId: string | null,
  isPremium: boolean,
): boolean {
  if (isGuest(isGuestFlag, userId)) return false;
  return isPremium;
}