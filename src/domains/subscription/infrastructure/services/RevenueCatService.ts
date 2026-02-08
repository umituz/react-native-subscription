/**
 * RevenueCat Service Implementation
 * Main service class for RevenueCat operations
 */

import Purchases from "react-native-purchases";
import type {
    PurchasesOffering,
    PurchasesPackage,
    CustomerInfo,
} from "react-native-purchases";
import type {
    IRevenueCatService,
    InitializeResult,
    PurchaseResult,
    RestoreResult,
} from "../../../../shared/application/ports/IRevenueCatService";
import type { RevenueCatConfig } from "../../core/RevenueCatConfig";
import { resolveApiKey } from "../utils/ApiKeyResolver";
import { initializeSDK } from "./RevenueCatInitializer";
import { fetchOfferings } from "./OfferingsFetcher";
import { handlePurchase } from "./PurchaseHandler";
import { handleRestore } from "./RestoreHandler";
import { CustomerInfoListenerManager } from "./CustomerInfoListenerManager";
import { ServiceStateManager } from "./ServiceStateManager";

export class RevenueCatService implements IRevenueCatService {
    private stateManager: ServiceStateManager;
    private listenerManager: CustomerInfoListenerManager;

    constructor(config: RevenueCatConfig) {
        this.stateManager = new ServiceStateManager(config);
        this.listenerManager = new CustomerInfoListenerManager();
    }

    getRevenueCatKey(): string | null {
        return resolveApiKey(this.stateManager.getConfig());
    }

    isInitialized(): boolean {
        return this.stateManager.isInitialized();
    }

    getCurrentUserId(): string | null {
        return this.stateManager.getCurrentUserId();
    }

    private getSDKParams() {
        return {
            config: this.stateManager.getConfig(),
            isInitialized: () => this.isInitialized(),
            getCurrentUserId: () => this.stateManager.getCurrentUserId(),
            setInitialized: (value: boolean) => this.stateManager.setInitialized(value),
            setCurrentUserId: (id: string | null) => this.stateManager.setCurrentUserId(id),
        };
    }

    async initialize(userId: string, apiKey?: string): Promise<InitializeResult> {
        if (this.isInitialized() && this.getCurrentUserId() === userId) {
            const customerInfo = await Purchases.getCustomerInfo();
            const isPremium = !!customerInfo.entitlements.active[this.stateManager.getConfig().entitlementIdentifier];
            return {
                success: true,
                offering: await this.fetchOfferings(),
                isPremium,
            };
        }

        const result = await initializeSDK(this.getSDKParams(), userId, apiKey);

        if (result.success) {
            this.listenerManager.setUserId(userId);
            this.listenerManager.setupListener(this.stateManager.getConfig());
        }

        return result;
    }

    async fetchOfferings(): Promise<PurchasesOffering | null> {
        return fetchOfferings(this.getSDKParams());
    }

    async purchasePackage(
        pkg: PurchasesPackage,
        userId: string
    ): Promise<PurchaseResult> {
        return handlePurchase(this.getSDKParams(), pkg, userId);
    }

    async restorePurchases(userId: string): Promise<RestoreResult> {
        return handleRestore(this.getSDKParams(), userId);
    }

    async getCustomerInfo(): Promise<CustomerInfo | null> {
        if (!this.isInitialized()) {
            return null;
        }
        return Purchases.getCustomerInfo();
    }

    async reset(): Promise<void> {
        if (!this.isInitialized()) {
            return;
        }

        this.listenerManager.destroy();

        try {
            await Purchases.logOut();
            this.stateManager.setInitialized(false);
        } catch {
            // Silent error handling
        }
    }
}

let revenueCatServiceInstance: RevenueCatService | null = null;

export function initializeRevenueCatService(
    config: RevenueCatConfig
): RevenueCatService {
    if (!revenueCatServiceInstance) {
        revenueCatServiceInstance = new RevenueCatService(config);
    }
    return revenueCatServiceInstance;
}

export function getRevenueCatService(): RevenueCatService | null {
    return revenueCatServiceInstance;
}

export function resetRevenueCatService(): void {
    revenueCatServiceInstance = null;
}
