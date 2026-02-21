import type { SubscriptionManagerConfig } from "./SubscriptionManager.types";

import type { IRevenueCatService } from "../../../../shared/application/ports/IRevenueCatService";
import { SubscriptionInternalState } from "./SubscriptionInternalState";

export function ensureConfigured(config: SubscriptionManagerConfig | null): void {
    if (!config) {
        throw new Error("SubscriptionManager not configured");
    }
}

export function getCurrentUserIdOrThrow(state: SubscriptionInternalState): string {
    const userId = state.initCache.getCurrentUserId();
    if (userId == null) {
        throw new Error("SubscriptionManager not initialized - no current user ID available");
    }
    return userId;
}

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

export function ensureServiceAvailable(service: IRevenueCatService | null): void {
    if (!service) {
        throw new Error("Service instance not available");
    }
}
