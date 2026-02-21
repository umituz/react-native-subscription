import { USER_TIER, type UserTierInfo } from './types';

export function getUserTierInfo(
  isAnonymous: boolean,
  userId: string | null,
  isPremium: boolean,
): UserTierInfo {
  if (isAnonymous || userId === null) {
    return {
      tier: USER_TIER.ANONYMOUS,
      isPremium: false,
      isAnonymous: true,
      isAuthenticated: false,
      userId: null,
    };
  }

  return {
    tier: isPremium ? USER_TIER.PREMIUM : USER_TIER.FREEMIUM,
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
