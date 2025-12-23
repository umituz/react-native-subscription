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
import {
  trackPackageError,
  addPackageBreadcrumb,
} from "@umituz/react-native-sentry";

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
  addPackageBreadcrumb("subscription", "Purchase started", {
    productId: pkg.product.identifier,
    userId,
  });

  if (!deps.isInitialized()) {
    const error = new RevenueCatInitializationError();
    trackPackageError(error, {
      packageName: "subscription",
      operation: "purchase",
      userId,
      productId: pkg.product.identifier,
    });
    throw error;
  }

  const consumableIds = deps.config.consumableProductIdentifiers || [];
  const isConsumable = isConsumableProduct(pkg, consumableIds);

  try {
    const purchaseResult = await Purchases.purchasePackage(pkg);
    const customerInfo = purchaseResult.customerInfo;

    if (isConsumable) {
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

    const entitlementError = new RevenueCatPurchaseError(
      "Purchase completed but premium entitlement not active",
      pkg.product.identifier
    );
    trackPackageError(entitlementError, {
      packageName: "subscription",
      operation: "purchase",
      userId,
      productId: pkg.product.identifier,
      reason: "entitlement_not_active",
    });
    throw entitlementError;
  } catch (error) {
    if (isUserCancelledError(error)) {
      addPackageBreadcrumb("subscription", "Purchase cancelled by user", {
        productId: pkg.product.identifier,
        userId,
      });
      return { success: false, isPremium: false };
    }
    const errorMessage = getErrorMessage(error, "Purchase failed");
    const purchaseError = new RevenueCatPurchaseError(errorMessage, pkg.product.identifier);
    trackPackageError(purchaseError, {
      packageName: "subscription",
      operation: "purchase",
      userId,
      productId: pkg.product.identifier,
      originalError: error instanceof Error ? error.message : String(error),
    });
    throw purchaseError;
  }
}
