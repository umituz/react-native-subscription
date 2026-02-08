/**
 * Customer Info Listener Manager
 * Handles RevenueCat customer info update listeners with renewal detection
 */

import Purchases, {
    type CustomerInfo,
    type CustomerInfoUpdateListener,
} from "react-native-purchases";
import type { RevenueCatConfig } from "../../core/RevenueCatConfig";
import { syncPremiumStatus } from "../utils/PremiumStatusSyncer";
import {
    detectRenewal,
    updateRenewalState,
    type RenewalState,
} from "../utils/RenewalDetector";

export class CustomerInfoListenerManager {
    private listener: CustomerInfoUpdateListener | null = null;
    private currentUserId: string | null = null;
    private renewalState: RenewalState = {
        previousExpirationDate: null,
        previousProductId: null,
    };

    setUserId(userId: string): void {
        // Reset renewal state when user changes to prevent state leak between users
        if (this.currentUserId && this.currentUserId !== userId) {
            this.renewalState = {
                previousExpirationDate: null,
                previousProductId: null,
            };
        }
        this.currentUserId = userId;
    }

    clearUserId(): void {
        this.currentUserId = null;
        this.renewalState = {
            previousExpirationDate: null,
            previousProductId: null,
        };
    }

    setupListener(config: RevenueCatConfig): void {
        this.removeListener();

        this.listener = async (customerInfo: CustomerInfo) => {
            if (!this.currentUserId) {
                return;
            }

            const renewalResult = detectRenewal(
                this.renewalState,
                customerInfo,
                config.entitlementIdentifier
            );

            // Handle renewal (same product, extended expiration)
            if (renewalResult.isRenewal && config.onRenewalDetected) {
                try {
                    await config.onRenewalDetected(
                        this.currentUserId,
                        renewalResult.productId!,
                        renewalResult.newExpirationDate!,
                        customerInfo
                    );
                } catch (error) {
                    if (__DEV__) {
                        console.error("[CustomerInfoListener] Renewal callback failed:", error);
                    }
                }
            }

            // Handle plan change (upgrade/downgrade)
            if (renewalResult.isPlanChange && config.onPlanChanged) {
                try {
                    await config.onPlanChanged(
                        this.currentUserId,
                        renewalResult.productId!,
                        renewalResult.previousProductId!,
                        renewalResult.isUpgrade,
                        customerInfo
                    );
                } catch (error) {
                    if (__DEV__) {
                        console.error("[CustomerInfoListener] Plan change callback failed:", error);
                    }
                }
            }

            this.renewalState = updateRenewalState(this.renewalState, renewalResult);

            // Only sync premium status if NOT a renewal or plan change
            // This prevents double credit initialization
            if (!renewalResult.isRenewal && !renewalResult.isPlanChange) {
                try {
                    await syncPremiumStatus(config, this.currentUserId, customerInfo);
                } catch (error) {
                    if (__DEV__) {
                        console.error("[CustomerInfoListener] syncPremiumStatus failed:", error);
                    }
                }
            }
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
        // Reset renewal state to ensure clean state
        this.renewalState = {
            previousExpirationDate: null,
            previousProductId: null,
        };
    }
}
