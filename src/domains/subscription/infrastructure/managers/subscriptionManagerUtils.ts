import type { SubscriptionManagerConfig } from "./SubscriptionManager.types";
import type { IRevenueCatService } from "../../../../shared/application/ports/IRevenueCatService";
import { getRevenueCatService } from "../services/revenueCatServiceInstance";
import type { InitializationCache } from "../utils/InitializationCache";

export function ensureConfigured(config: SubscriptionManagerConfig | null): void {
    if (!config) {
        throw new Error("SubscriptionManager not configured");
    }
}

export function getCurrentUserIdOrThrow(initCache: InitializationCache): string {
    const userId = initCache.getCurrentUserId();
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
