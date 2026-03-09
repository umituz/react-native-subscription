import type { CustomerInfo } from "react-native-purchases";
import type { RevenueCatConfig } from "../../../revenuecat/core/types";
import type { PurchaseSource } from "../../core/SubscriptionConstants";
import type { PackageType } from "../../../revenuecat/core/types";
import { getPremiumEntitlement } from "../../../revenuecat/core/types";
import type { PeriodType } from "../../core/SubscriptionConstants";

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
            const subscription = customerInfo.subscriptionsByProductIdentifier?.[premiumEntitlement.productIdentifier];

            await config.onPremiumStatusChanged({
                userId,
                isPremium: true,
                productId: premiumEntitlement.productIdentifier,
                expirationDate: premiumEntitlement.expirationDate ?? null,
                willRenew: premiumEntitlement.willRenew,
                periodType: premiumEntitlement.periodType as PeriodType | undefined,
                storeTransactionId: subscription?.storeTransactionId ?? undefined,
                unsubscribeDetectedAt: premiumEntitlement.unsubscribeDetectedAt ?? null,
                billingIssueDetectedAt: premiumEntitlement.billingIssueDetectedAt ?? null,
                store: premiumEntitlement.store ?? null,
                ownershipType: premiumEntitlement.ownershipType ?? null,
            });
        } else {
            await config.onPremiumStatusChanged({ userId, isPremium: false });
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
    if (!config.onPurchaseCompleted) return;

    await config.onPurchaseCompleted({ userId, productId, customerInfo, source, packageType });
}

export async function notifyRestoreCompleted(
    config: RevenueCatConfig,
    userId: string,
    isPremium: boolean,
    customerInfo: CustomerInfo
): Promise<void> {
    if (!config.onRestoreCompleted) return;

    try {
        await config.onRestoreCompleted({ userId, isPremium, customerInfo });
    } catch (error) {
        console.error('[PremiumStatusSyncer] Restore callback failed:', error instanceof Error ? error.message : String(error));
    }
}
