/**
 * Premium Status Syncer
 * Syncs premium status to database via callbacks
 */

import type { CustomerInfo } from "react-native-purchases";
import type { RevenueCatConfig } from "../../../revenuecat/core/types";
import type { PurchaseSource } from "../../../subscription/core/SubscriptionConstants";
import { getPremiumEntitlement } from "../../../revenuecat/core/types";

declare const __DEV__: boolean;

export async function syncPremiumStatus(
    config: RevenueCatConfig,
    userId: string,
    customerInfo: CustomerInfo
): Promise<{ success: boolean; error?: Error }> {
    if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log("[PremiumStatusSyncer] syncPremiumStatus called:", {
            userId,
            hasCallback: !!config.onPremiumStatusChanged,
            entitlementId: config.entitlementIdentifier,
            activeEntitlements: Object.keys(customerInfo.entitlements.active),
        });
    }

    if (!config.onPremiumStatusChanged) {
        if (typeof __DEV__ !== "undefined" && __DEV__) {
            console.log("[PremiumStatusSyncer] No onPremiumStatusChanged callback - skipping");
        }
        return { success: true };
    }

    const premiumEntitlement = getPremiumEntitlement(
        customerInfo,
        config.entitlementIdentifier
    );

    if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log("[PremiumStatusSyncer] Premium entitlement:", {
            found: !!premiumEntitlement,
            productId: premiumEntitlement?.productIdentifier,
            expirationDate: premiumEntitlement?.expirationDate,
            willRenew: premiumEntitlement?.willRenew,
            periodType: premiumEntitlement?.periodType,
        });
    }

    try {
        if (premiumEntitlement) {
            if (typeof __DEV__ !== "undefined" && __DEV__) {
                console.log("[PremiumStatusSyncer] Calling onPremiumStatusChanged with premium=true");
            }
            await config.onPremiumStatusChanged(
                userId,
                true,
                premiumEntitlement.productIdentifier,
                premiumEntitlement.expirationDate ?? undefined,
                premiumEntitlement.willRenew,
                premiumEntitlement.periodType as "NORMAL" | "INTRO" | "TRIAL" | undefined
            );
        } else {
            if (typeof __DEV__ !== "undefined" && __DEV__) {
                console.log("[PremiumStatusSyncer] Calling onPremiumStatusChanged with premium=false");
            }
            await config.onPremiumStatusChanged(userId, false, undefined, undefined, undefined, undefined);
        }
        if (typeof __DEV__ !== "undefined" && __DEV__) {
            console.log("[PremiumStatusSyncer] onPremiumStatusChanged completed successfully");
        }
        return { success: true };
    } catch (error) {
        console.error('[PremiumStatusSyncer] Premium status change callback failed', {
            userId,
            isPremium: !!premiumEntitlement,
            productId: premiumEntitlement?.productIdentifier,
            error
        });
        return {
            success: false,
            error: error instanceof Error ? error : new Error(String(error))
        };
    }
}

export async function notifyPurchaseCompleted(
    config: RevenueCatConfig,
    userId: string,
    productId: string,
    customerInfo: CustomerInfo,
    source?: PurchaseSource
): Promise<void> {
    if (!config.onPurchaseCompleted) {
        return;
    }

    try {
        await config.onPurchaseCompleted(userId, productId, customerInfo, source);
    } catch (error) {
        console.error('[PremiumStatusSyncer] Purchase completion callback failed', {
            userId,
            productId,
            source,
            error
        });
        // Silently fail callback notifications to prevent crashing the main flow
    }
}

export async function notifyRestoreCompleted(
    config: RevenueCatConfig,
    userId: string,
    isPremium: boolean,
    customerInfo: CustomerInfo
): Promise<void> {
    if (!config.onRestoreCompleted) {
        return;
    }

    try {
        await config.onRestoreCompleted(userId, isPremium, customerInfo);
    } catch (error) {
        console.error('[PremiumStatusSyncer] Restore completion callback failed', {
            userId,
            isPremium,
            error
        });
        // Silently fail callback notifications to prevent crashing the main flow
    }
}
