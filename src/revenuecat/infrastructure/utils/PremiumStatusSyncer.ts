/**
 * Premium Status Syncer
 * Syncs premium status to database via callbacks
 */

import type { CustomerInfo } from "react-native-purchases";
import type { RevenueCatConfig } from "../../domain/value-objects/RevenueCatConfig";
import { getPremiumEntitlement } from "../../domain/types/RevenueCatTypes";

declare const __DEV__: boolean;

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
    } catch (error) {
        if (__DEV__) {
            console.error('[PremiumStatusSyncer] syncPremiumStatus failed:', error);
        }
    }
}

export async function notifyPurchaseCompleted(
    config: RevenueCatConfig,
    userId: string,
    productId: string,
    customerInfo: CustomerInfo,
    source?: string
): Promise<void> {
    if (__DEV__) {
        console.log('[PremiumStatusSyncer] notifyPurchaseCompleted called:', {
            userId,
            productId,
            source,
            hasCallback: !!config.onPurchaseCompleted,
        });
    }

    if (!config.onPurchaseCompleted) {
        if (__DEV__) {
            console.warn('[PremiumStatusSyncer] No onPurchaseCompleted callback configured!');
        }
        return;
    }

    try {
        await config.onPurchaseCompleted(userId, productId, customerInfo, source);
        if (__DEV__) {
            console.log('[PremiumStatusSyncer] onPurchaseCompleted callback executed successfully');
        }
    } catch (error) {
        if (__DEV__) {
            console.error('[PremiumStatusSyncer] onPurchaseCompleted callback failed:', error);
        }
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
        if (__DEV__) {
            console.error('[PremiumStatusSyncer] notifyRestoreCompleted failed:', error);
        }
    }
}
