/**
 * Subscription Config Value Object
 */

import { ISubscriptionRepository } from "../application/ports/ISubscriptionRepository";
import { SubscriptionStatus } from "../../domains/subscription/core/SubscriptionStatus";

export interface SubscriptionConfig {
    repository: ISubscriptionRepository;
    revenueCatApiKey?: string;
    entitlements?: string[];
    debugMode?: boolean;
    onStatusChanged?: (userId: string, status: SubscriptionStatus) => Promise<void> | void;
    onError?: (error: Error, operation: string) => Promise<void> | void;
}
