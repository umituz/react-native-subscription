/**
 * Subscription Service Interface
 * Port for subscription operations
 */

import type { SubscriptionStatus } from '../../domain/entities/SubscriptionStatus';

export interface ISubscriptionService {
  /**
   * Get subscription status for a user
   */
  getSubscriptionStatus(userId: string): Promise<SubscriptionStatus>;

  /**
   * Check if user has active subscription
   */
  isPremium(userId: string): Promise<boolean>;

  /**
   * Activate subscription
   */
  activateSubscription(
    userId: string,
    productId: string,
    expiresAt: string | null,
  ): Promise<SubscriptionStatus>;

  /**
   * Deactivate subscription
   */
  deactivateSubscription(userId: string): Promise<SubscriptionStatus>;

  /**
   * Update subscription status
   */
  updateSubscriptionStatus(
    userId: string,
    updates: Partial<SubscriptionStatus>,
  ): Promise<SubscriptionStatus>;
}





