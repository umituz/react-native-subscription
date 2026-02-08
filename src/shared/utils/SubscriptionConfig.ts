/**
 * Subscription Config Value Object
 */

import { ISubscriptionRepository } from "../../application/ports/ISubscriptionRepository";
import { SubscriptionStatus } from "../entities/SubscriptionStatus";

export interface SubscriptionConfig {
    repository: ISubscriptionRepository;
    revenueCatApiKey?: string;
    entitlements?: string[];
    debugMode?: boolean;
    onStatusChanged?: (userId: string, status: SubscriptionStatus) => Promise<void> | void;
    onError?: (error: Error, context: string) => Promise<void> | void;
}
