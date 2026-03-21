import type { CustomerInfo } from "react-native-purchases";
import type { RevenueCatConfig } from "../../../revenuecat/core/types/RevenueCatConfig";
import type { PurchaseSource } from "../../core/SubscriptionConstants";
import type { PackageType } from "../../../revenuecat/core/types/RevenueCatTypes";
import { getPremiumEntitlement } from "../../../revenuecat/core/types/RevenueCatTypes";
import { createLogger } from "../../../shared/utils/logger";

const logger = createLogger("PremiumStatusSyncer");

export async function syncPremiumStatus(
    config: RevenueCatConfig,
    userId: string,
    customerInfo: CustomerInfo
): Promise<{ success: boolean; error?: Error }> {
    logger.debug("syncPremiumStatus called", {
        userId,
        hasCallback: !!config.onPremiumStatusChanged,
        entitlementId: config.entitlementIdentifier,
        activeEntitlements: Object.keys(customerInfo.entitlements.active),
    });

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
                expirationDate: premiumEntitlement.expirationDate ?? undefined,
                willRenew: premiumEntitlement.willRenew,
                periodType: premiumEntitlement.periodType,
                storeTransactionId: subscription?.storeTransactionId ?? undefined,
                unsubscribeDetectedAt: premiumEntitlement.unsubscribeDetectedAt ?? undefined,
                billingIssueDetectedAt: premiumEntitlement.billingIssueDetectedAt ?? undefined,
                store: premiumEntitlement.store ?? undefined,
                ownershipType: premiumEntitlement.ownershipType ?? undefined,
            });
        } else {
            await config.onPremiumStatusChanged({ userId, isPremium: false });
        }
        return { success: true };
    } catch (error) {
        logger.error("Premium status callback failed", error, { userId });

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
        logger.error("Restore callback failed", error);
    }
}
