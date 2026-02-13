/**
 * Premium Status Syncer
 * Syncs premium status to database via callbacks
 */

import type { CustomerInfo } from "react-native-purchases";
import type { RevenueCatConfig } from "../../../revenuecat/core/types";
import type { PurchaseSource } from "../../../subscription/core/SubscriptionConstants";
import { getPremiumEntitlement } from "../../../revenuecat/core/types";

export async function syncPremiumStatus(
    config: RevenueCatConfig,
    userId: string,
    customerInfo: CustomerInfo
): Promise<void> {
    if (!config.onPremiumStatusChanged) {
        return;
    }

    const premiumEntitlement = getPremiumEntitlement(
        customerInfo,
        config.entitlementIdentifier
    );

    try {
        if (premiumEntitlement) {
            await config.onPremiumStatusChanged(
                userId,
                true,
                premiumEntitlement.productIdentifier,
                premiumEntitlement.expirationDate ?? undefined,
                premiumEntitlement.willRenew,
                premiumEntitlement.periodType as "NORMAL" | "INTRO" | "TRIAL" | undefined
            );
        } else {
            await config.onPremiumStatusChanged(userId, false, undefined, undefined, undefined, undefined);
        }
    } catch (_error) {
        // Silently fail callback notifications to prevent crashing the main flow
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
    } catch (_error) {
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
    } catch (_error) {
        // Silently fail callback notifications to prevent crashing the main flow
    }
}
