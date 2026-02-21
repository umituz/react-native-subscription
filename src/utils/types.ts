import { USER_TIER, type UserTierType } from '../domains/subscription/core/SubscriptionConstants';

export type UserTier = UserTierType;
export { USER_TIER };

export interface UserTierInfo {
  tier: UserTier;
  isPremium: boolean;
  isAnonymous: boolean;
  isAuthenticated: boolean;
  userId: string | null;
}

export interface PremiumStatusFetcher {
  isPremium(userId: string): Promise<boolean>;
}
