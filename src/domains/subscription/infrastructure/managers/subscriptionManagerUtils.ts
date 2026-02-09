/**
 * Subscription Manager Utilities
 * Validation and helper functions for SubscriptionManager
 */

import type { SubscriptionManagerConfig } from "./SubscriptionManager";
import type { IRevenueCatService } from "../../../../shared/application/ports/IRevenueCatService";
import { SubscriptionInternalState } from "./SubscriptionInternalState";

/**
 * Validate that manager is configured
 */
export function ensureConfigured(config: SubscriptionManagerConfig | null): void {
    if (!config) {
        throw new Error("SubscriptionManager not configured");
    }
}

/**
 * Get current user ID or throw
 */
export function getCurrentUserIdOrThrow(state: SubscriptionInternalState): string {
    const userId = state.initCache.getCurrentUserId();
    if (!userId) {
        throw new Error("No current user found");
    }
    return userId;
}

/**
 * Get service instance or initialize
 */
export function getOrCreateService(
    currentInstance: IRevenueCatService | null
): IRevenueCatService {
    if (currentInstance) {
        return currentInstance;
    }

    const { getRevenueCatService } = require("../services/RevenueCatService");
    const serviceInstance = getRevenueCatService();

    if (!serviceInstance) {
        throw new Error("Service instance not available");
    }

    return serviceInstance;
}

/**
 * Validate service is available
 */
export function ensureServiceAvailable(service: IRevenueCatService | null): void {
    if (!service) {
        throw new Error("Service instance not available");
    }
}
