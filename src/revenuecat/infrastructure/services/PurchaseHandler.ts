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
import { usePendingPurchaseStore } from "../../../infrastructure/stores/PendingPurchaseStore";

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
declare const __DEV__: boolean;

export async function handlePurchase(
    deps: PurchaseHandlerDeps,
    pkg: PurchasesPackage,
    userId: string
): Promise<PurchaseResult> {
    if (__DEV__) {
        console.log('[DEBUG PurchaseHandler] handlePurchase called', {
            productId: pkg.product.identifier,
            userId,
            isInitialized: deps.isInitialized(),
        });
    }

    if (!deps.isInitialized()) {
        if (__DEV__) {
            console.log('[DEBUG PurchaseHandler] Not initialized, throwing error');
        }
        throw new RevenueCatInitializationError();
    }

    const consumableIds = deps.config.consumableProductIdentifiers || [];
    const isConsumable = isConsumableProduct(pkg, consumableIds);

    try {
        if (__DEV__) {
            console.log('[DEBUG PurchaseHandler] Calling Purchases.purchasePackage...');
        }
        const purchaseResult = await Purchases.purchasePackage(pkg);
        const customerInfo = purchaseResult.customerInfo;

        if (__DEV__) {
            console.log('[DEBUG PurchaseHandler] Purchase completed', {
                productId: pkg.product.identifier,
                activeEntitlements: Object.keys(customerInfo.entitlements.active),
            });
        }

        // Get purchase source from pending purchase store
        const pendingPurchaseStore = usePendingPurchaseStore.getState();
        const pending = pendingPurchaseStore.getPendingPurchase();
        const source = pending?.source;

        if (isConsumable) {
            if (__DEV__) {
                console.log('[DEBUG PurchaseHandler] Consumable purchase SUCCESS', { source });
            }
            await notifyPurchaseCompleted(
                deps.config,
                userId,
                pkg.product.identifier,
                customerInfo,
                source
            );
            // Clear pending purchase after successful purchase
            pendingPurchaseStore.clearPendingPurchase();
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

        if (__DEV__) {
            console.log('[DEBUG PurchaseHandler] Checking premium status', {
                entitlementIdentifier,
                isPremium,
                allEntitlements: customerInfo.entitlements.active,
                source,
            });
        }

        if (isPremium) {
            if (__DEV__) {
                console.log('[DEBUG PurchaseHandler] Premium purchase SUCCESS', { source });
            }
            await syncPremiumStatus(deps.config, userId, customerInfo);
            await notifyPurchaseCompleted(
                deps.config,
                userId,
                pkg.product.identifier,
                customerInfo,
                source
            );
            // Clear pending purchase after successful purchase
            pendingPurchaseStore.clearPendingPurchase();
            return { success: true, isPremium: true, customerInfo };
        }

        // In Preview API mode (Expo Go), purchases complete but entitlements aren't active
        // Treat the purchase as successful for testing purposes
        if (deps.isUsingTestStore()) {
            if (__DEV__) {
                console.log('[DEBUG PurchaseHandler] Test store purchase SUCCESS', { source });
            }
            await notifyPurchaseCompleted(
                deps.config,
                userId,
                pkg.product.identifier,
                customerInfo,
                source
            );
            // Clear pending purchase after successful purchase
            pendingPurchaseStore.clearPendingPurchase();
            return { success: true, isPremium: false, customerInfo };
        }

        if (__DEV__) {
            console.log('[DEBUG PurchaseHandler] Purchase FAILED - no entitlement');
        }
        throw new RevenueCatPurchaseError(
            "Purchase completed but premium entitlement not active",
            pkg.product.identifier
        );
    } catch (error) {
        if (__DEV__) {
            console.error('[DEBUG PurchaseHandler] Purchase error caught', {
                error,
                isUserCancelled: isUserCancelledError(error),
            });
        }
        if (isUserCancelledError(error)) {
            if (__DEV__) {
                console.log('[DEBUG PurchaseHandler] User cancelled');
            }
            return { success: false, isPremium: false };
        }
        const errorMessage = getErrorMessage(error, "Purchase failed");
        if (__DEV__) {
            console.error('[DEBUG PurchaseHandler] Throwing error:', errorMessage);
        }
        throw new RevenueCatPurchaseError(errorMessage, pkg.product.identifier);
    }
}
