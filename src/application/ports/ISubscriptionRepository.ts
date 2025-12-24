/**
 * ISubscriptionRepository Interface
 */

import { SubscriptionStatus } from '@domain/entities/SubscriptionStatus';

export interface ISubscriptionRepository {
    getSubscriptionStatus(userId: string): Promise<SubscriptionStatus | null>;
    saveSubscriptionStatus(userId: string, status: SubscriptionStatus): Promise<void>;
    updateSubscriptionStatus(userId: string, status: Partial<SubscriptionStatus>): Promise<SubscriptionStatus>;
    syncSubscription(userId: string): Promise<SubscriptionStatus>;
    isSubscriptionValid(status: SubscriptionStatus): boolean;
}
