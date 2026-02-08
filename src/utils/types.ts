/**
 * User Tier Types
 *
 * Type definitions for user tier system
 */

import { USER_TIER, type UserTierType } from '../domains/subscription/core/SubscriptionConstants';

export type UserTier = UserTierType;
export { USER_TIER };

export interface UserTierInfo {
  /** User tier classification */
  tier: UserTier;

  /** Whether user has premium access */
  isPremium: boolean;

  /** Whether user is anonymous (not authenticated) */
  isAnonymous: boolean;

  /** Whether user is authenticated */
  isAuthenticated: boolean;

  /** User ID (null for anonymous users) */
  userId: string | null;
}

/**
 * Premium status fetcher interface
 * Apps should implement this to provide premium status from their database
 */
export interface PremiumStatusFetcher {
  /**
   * Check if user has active premium subscription
   * @param userId - User ID (never null, this is only called for authenticated users)
   * @returns Promise<boolean> - Whether user has premium subscription
   */
  isPremium(userId: string): Promise<boolean>;
}