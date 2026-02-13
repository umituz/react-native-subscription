import Purchases, { type PurchasesPackage } from "react-native-purchases";
import type { PurchaseResult } from "../../../../shared/application/ports/IRevenueCatService";
import {
  RevenueCatPurchaseError,
  RevenueCatInitializationError,
  RevenueCatNetworkError,
} from "../../../revenuecat/core/errors";
import type { RevenueCatConfig } from "../../../revenuecat/core/types";
import {
  isUserCancelledError,
  isNetworkError,
  isAlreadyPurchasedError,
  isInvalidCredentialsError,
  getRawErrorMessage,
  getErrorCode,
} from "../../../revenuecat/core/types";
import { syncPremiumStatus, notifyPurchaseCompleted } from "../utils/PremiumStatusSyncer";
import { getSavedPurchase, clearSavedPurchase } from "../../presentation/useAuthAwarePurchase";
import { handleRestore } from "./RestoreHandler";

export interface PurchaseHandlerDeps {
  config: RevenueCatConfig;
  isInitialized: () => boolean;
}

function isConsumableProduct(pkg: PurchasesPackage, consumableIds: string[]): boolean {
  if (consumableIds.length === 0) return false;
  const identifier = pkg.product.identifier.toLowerCase();
  return consumableIds.some((id) => identifier.includes(id.toLowerCase()));
}

export async function handlePurchase(
  deps: PurchaseHandlerDeps,
  pkg: PurchasesPackage,
  userId: string
): Promise<PurchaseResult> {
  if (!deps.isInitialized()) throw new RevenueCatInitializationError();

  const consumableIds = deps.config.consumableProductIdentifiers || [];
  const isConsumable = isConsumableProduct(pkg, consumableIds);
  const entitlementIdentifier = deps.config.entitlementIdentifier;

  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const savedPurchase = getSavedPurchase();
    const source = savedPurchase?.source;

    if (isConsumable) {
      await notifyPurchaseCompleted(deps.config, userId, pkg.product.identifier, customerInfo, source);
      clearSavedPurchase();
      return { success: true, isPremium: false, customerInfo, isConsumable: true, productId: pkg.product.identifier };
    }

    const isPremium = !!customerInfo.entitlements.active[entitlementIdentifier];

    if (isPremium) {
      await syncPremiumStatus(deps.config, userId, customerInfo);
      await notifyPurchaseCompleted(deps.config, userId, pkg.product.identifier, customerInfo, source);
      clearSavedPurchase();
      return { success: true, isPremium: true, customerInfo, productId: pkg.product.identifier };
    }

    // Purchase completed but no entitlement - still notify (test store scenario)
    await notifyPurchaseCompleted(deps.config, userId, pkg.product.identifier, customerInfo, source);
    clearSavedPurchase();
    return { success: true, isPremium: false, customerInfo, productId: pkg.product.identifier };
  } catch (error) {
    // User cancelled - not an error, just return false
    if (isUserCancelledError(error)) {
      return { success: false, isPremium: false, productId: pkg.product.identifier };
    }

    // Already purchased - auto-restore (RevenueCat best practice)
    if (isAlreadyPurchasedError(error)) {
      try {
        const restoreResult = await handleRestore(deps, userId);
        if (restoreResult.success && restoreResult.isPremium) {
          // Restore succeeded, notify and return success
          await notifyPurchaseCompleted(deps.config, userId, pkg.product.identifier, restoreResult.customerInfo, getSavedPurchase()?.source);
          clearSavedPurchase();
          return {
            success: true,
            isPremium: true,
            customerInfo: restoreResult.customerInfo,
            productId: restoreResult.productId || pkg.product.identifier,
          };
        }
      } catch (_restoreError) {
        // Restore failed, throw original error
        throw new RevenueCatPurchaseError(
          "You already own this subscription, but restore failed. Please try restoring purchases manually.",
          pkg.product.identifier,
          error instanceof Error ? error : undefined
        );
      }
      // Restore succeeded but no premium - throw original error
      throw new RevenueCatPurchaseError(
        "You already own this subscription, but it could not be activated.",
        pkg.product.identifier,
        error instanceof Error ? error : undefined
      );
    }

    // Network error - throw specific error type
    if (isNetworkError(error)) {
      throw new RevenueCatNetworkError(
        "Network error during purchase. Please check your internet connection and try again.",
        error instanceof Error ? error : undefined
      );
    }

    // Invalid credentials - configuration error
    if (isInvalidCredentialsError(error)) {
      throw new RevenueCatPurchaseError(
        "App configuration error. Please contact support.",
        pkg.product.identifier,
        error instanceof Error ? error : undefined
      );
    }

    // Generic error with code
    const errorCode = getErrorCode(error);
    const errorMessage = getRawErrorMessage(error, "Purchase failed");
    const enhancedMessage = errorCode
      ? `${errorMessage} (Code: ${errorCode})`
      : errorMessage;

    throw new RevenueCatPurchaseError(
      enhancedMessage,
      pkg.product.identifier,
      error instanceof Error ? error : undefined
    );
  }
}
