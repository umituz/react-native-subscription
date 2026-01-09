/**
 * Premium Status Syncer
 * Syncs premium status to database via callbacks
 */

import type { CustomerInfo } from "react-native-purchases";
import type { RevenueCatConfig } from "../../domain/value-objects/RevenueCatConfig";
import { getPremiumEntitlement } from "../../domain/types/RevenueCatTypes";

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
                premiumEntitlement.expirationDate ?? undefined
            );
        } else {
            await config.onPremiumStatusChanged(userId, false);
        }
    } catch {
        // Silent error handling
    }
}

export async function notifyPurchaseCompleted(
    config: RevenueCatConfig,
    userId: string,
    productId: string,
    customerInfo: CustomerInfo
): Promise<void> {
    if (!config.onPurchaseCompleted) {
        return;
    }

    try {
        await config.onPurchaseCompleted(userId, productId, customerInfo);
    } catch {
        // Silent error handling
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
    } catch {
        // Silent error handling
    }
}
