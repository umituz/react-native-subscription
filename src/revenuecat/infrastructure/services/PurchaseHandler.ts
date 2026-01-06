/**
 * Purchase Handler
 * Handles RevenueCat purchase operations for both subscriptions and consumables
 */

import Purchases, { type PurchasesPackage } from "react-native-purchases";
import type { PurchaseResult } from "../../application/ports/IRevenueCatService";
import {
    RevenueCatPurchaseError,
    RevenueCatInitializationError,
} from "../../domain/errors/RevenueCatError";
import type { RevenueCatConfig } from "../../domain/value-objects/RevenueCatConfig";
import {
    isUserCancelledError,
    getErrorMessage,
} from "../../domain/types/RevenueCatTypes";
import {
    syncPremiumStatus,
    notifyPurchaseCompleted,
} from "../utils/PremiumStatusSyncer";

export interface PurchaseHandlerDeps {
    config: RevenueCatConfig;
    isInitialized: () => boolean;
    isUsingTestStore: () => boolean;
}

function isConsumableProduct(
    pkg: PurchasesPackage,
    consumableIds: string[]
): boolean {
    if (consumableIds.length === 0) return false;
    const identifier = pkg.product.identifier.toLowerCase();
    return consumableIds.some((id) => identifier.includes(id.toLowerCase()));
}

/**
 * Handle package purchase - supports both subscriptions and consumables
 */
export async function handlePurchase(
    deps: PurchaseHandlerDeps,
    pkg: PurchasesPackage,
    userId: string
): Promise<PurchaseResult> {
    if (!deps.isInitialized()) {
        throw new RevenueCatInitializationError();
    }

    const consumableIds = deps.config.consumableProductIdentifiers || [];
    const isConsumable = isConsumableProduct(pkg, consumableIds);

    try {
        const purchaseResult = await Purchases.purchasePackage(pkg);
        const customerInfo = purchaseResult.customerInfo;

        if (isConsumable) {
            await notifyPurchaseCompleted(
                deps.config,
                userId,
                pkg.product.identifier,
                customerInfo
            );
            return {
                success: true,
                isPremium: false,
                customerInfo,
                isConsumable: true,
                productId: pkg.product.identifier,
            };
        }

        const entitlementIdentifier = deps.config.entitlementIdentifier;
        const isPremium = !!customerInfo.entitlements.active[entitlementIdentifier];

        if (isPremium) {
            await syncPremiumStatus(deps.config, userId, customerInfo);
            await notifyPurchaseCompleted(
                deps.config,
                userId,
                pkg.product.identifier,
                customerInfo
            );
            return { success: true, isPremium: true, customerInfo };
        }

        // In Preview API mode (Expo Go), purchases complete but entitlements aren't active
        // Treat the purchase as successful for testing purposes
        if (deps.isUsingTestStore()) {
            await notifyPurchaseCompleted(
                deps.config,
                userId,
                pkg.product.identifier,
                customerInfo
            );
            return { success: true, isPremium: false, customerInfo };
        }

        throw new RevenueCatPurchaseError(
            "Purchase completed but premium entitlement not active",
            pkg.product.identifier
        );
    } catch (error) {
        if (isUserCancelledError(error)) {
            return { success: false, isPremium: false };
        }
        const errorMessage = getErrorMessage(error, "Purchase failed");
        throw new RevenueCatPurchaseError(errorMessage, pkg.product.identifier);
    }
}
