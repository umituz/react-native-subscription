/**
 * Subscription Repository Interface
 * Port for database operations
 *
 * SECURITY: Apps must implement this interface with their database.
 * Never expose database credentials or allow direct database access.
 */

import type { SubscriptionStatus } from '../../domain/entities/SubscriptionStatus';

export interface ISubscriptionRepository {
  /**
   * Get subscription status for a user
   * Returns null if user not found
   */
  getSubscriptionStatus(userId: string): Promise<SubscriptionStatus | null>;

  /**
   * Update subscription status for a user
   */
  updateSubscriptionStatus(
    userId: string,
    status: Partial<SubscriptionStatus>,
  ): Promise<SubscriptionStatus>;

  /**
   * Check if subscription is valid (not expired)
   * SECURITY: Always validate expiration server-side
   */
  isSubscriptionValid(status: SubscriptionStatus): boolean;
}



