/**
 * Subscription Service Interface
 * Defines the contract for subscription service operations
 */

import type { SubscriptionStatus } from '@domain/entities/SubscriptionStatus';

export interface ISubscriptionService {
    /**
     * Get current subscription status
     */
    getStatus(userId: string): Promise<SubscriptionStatus | null>;

    /**
     * Activate a subscription
     */
    activateSubscription(
        userId: string,
        productId: string,
        expiresAt: string | null
    ): Promise<SubscriptionStatus>;

    /**
     * Deactivate a subscription
     */
    deactivateSubscription(userId: string): Promise<SubscriptionStatus>;

    /**
     * Check if user has premium access
     */
    isPremium(userId: string): Promise<boolean>;
}
