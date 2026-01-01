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
    private entitlementIdentifier: string;

    constructor(entitlementIdentifier: string) {
        this.entitlementIdentifier = entitlementIdentifier;
    }

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

            const hasPremium =
                !!customerInfo.entitlements.active[this.entitlementIdentifier];

            if (hasPremium && config.onCreditRenewal) {
                const premiumEntitlement =
                    customerInfo.entitlements.active[this.entitlementIdentifier];

                if (premiumEntitlement && premiumEntitlement.expirationDate) {
                    const productId = premiumEntitlement.productIdentifier;
                    const renewalId = `renewal_${productId}_${premiumEntitlement.expirationDate}`;

                    try {
                        await config.onCreditRenewal(
                            this.currentUserId,
                            productId,
                            renewalId
                        );

                        if (config.onCreditsUpdated && this.currentUserId) {
                            config.onCreditsUpdated(this.currentUserId);
                        }
                    } catch {
                        // Silent error handling
                    }
                }
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
