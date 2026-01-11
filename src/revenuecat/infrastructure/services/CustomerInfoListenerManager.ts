/**
 * Customer Info Listener Manager
 * Handles RevenueCat customer info update listeners
 */

import Purchases, {
    type CustomerInfo,
    type CustomerInfoUpdateListener,
} from "react-native-purchases";
import type { RevenueCatConfig } from "../../domain/value-objects/RevenueCatConfig";
import { syncPremiumStatus } from "../utils/PremiumStatusSyncer";

export class CustomerInfoListenerManager {
    private listener: CustomerInfoUpdateListener | null = null;
    private currentUserId: string | null = null;

    setUserId(userId: string): void {
        this.currentUserId = userId;
    }

    clearUserId(): void {
        this.currentUserId = null;
    }

    setupListener(config: RevenueCatConfig): void {
        this.removeListener();

        this.listener = async (customerInfo: CustomerInfo) => {
            if (!this.currentUserId) {
                return;
            }

            syncPremiumStatus(config, this.currentUserId, customerInfo);
        };

        Purchases.addCustomerInfoUpdateListener(this.listener);
    }

    removeListener(): void {
        if (this.listener) {
            Purchases.removeCustomerInfoUpdateListener(this.listener);
            this.listener = null;
        }
    }

    destroy(): void {
        this.removeListener();
        this.clearUserId();
    }
}
