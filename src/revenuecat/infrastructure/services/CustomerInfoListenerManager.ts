/**
 * Customer Info Listener Manager
 * Handles RevenueCat customer info update listeners with renewal detection
 */

import Purchases, {
    type CustomerInfo,
    type CustomerInfoUpdateListener,
} from "react-native-purchases";
import type { RevenueCatConfig } from "../../domain/value-objects/RevenueCatConfig";
import { syncPremiumStatus } from "../utils/PremiumStatusSyncer";
import {
    detectRenewal,
    updateRenewalState,
    type RenewalState,
} from "../utils/RenewalDetector";

declare const __DEV__: boolean;

export class CustomerInfoListenerManager {
    private listener: CustomerInfoUpdateListener | null = null;
    private currentUserId: string | null = null;
    private renewalState: RenewalState = {
        previousExpirationDate: null,
        previousProductId: null,
    };

    setUserId(userId: string): void {
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

            if (renewalResult.isRenewal && config.onRenewalDetected) {
                if (__DEV__) {
                    console.log("[CustomerInfoListener] Renewal detected:", {
                        userId: this.currentUserId,
                        productId: renewalResult.productId,
                        newExpiration: renewalResult.newExpirationDate,
                    });
                }

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

            this.renewalState = updateRenewalState(this.renewalState, renewalResult);

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
