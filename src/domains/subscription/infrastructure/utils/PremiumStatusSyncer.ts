/**
 * Premium Status Syncer
 * Syncs premium status to database via callbacks
 */

import type { CustomerInfo } from "react-native-purchases";
import type { RevenueCatConfig, PackageType } from "../../../revenuecat/core/types";
import type { PurchaseSource } from "../../../subscription/core/SubscriptionConstants";
import { getPremiumEntitlement } from "../../../revenuecat/core/types";

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
        return { success: true };
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
        return { success: true };
    } catch (error) {
        console.error('[PremiumStatusSyncer] Premium status callback failed:', {
            userId,
            error: error instanceof Error ? error.message : String(error)
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
    source?: PurchaseSource,
    packageType?: PackageType | null
): Promise<void> {
    if (!config.onPurchaseCompleted) {
        return;
    }

    try {
        await config.onPurchaseCompleted(userId, productId, customerInfo, source, packageType);
    } catch (error) {
        // Silently fail callback notifications to prevent crashing the main flow
        console.error('[PremiumStatusSyncer] Purchase completed callback failed:', {
            userId,
            productId,
            error: error instanceof Error ? error.message : String(error)
        });
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
