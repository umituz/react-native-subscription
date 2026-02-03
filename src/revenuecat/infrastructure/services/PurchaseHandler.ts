import Purchases, { type PurchasesPackage } from "react-native-purchases";
import type { PurchaseResult } from "../../application/ports/IRevenueCatService";
import { RevenueCatPurchaseError, RevenueCatInitializationError } from "../../domain/errors/RevenueCatError";
import type { RevenueCatConfig } from "../../domain/value-objects/RevenueCatConfig";
import { isUserCancelledError, getErrorMessage } from "../../domain/types/RevenueCatTypes";
import { syncPremiumStatus, notifyPurchaseCompleted } from "../utils/PremiumStatusSyncer";
import { getSavedPurchase, clearSavedPurchase } from "../../../presentation/hooks/useAuthAwarePurchase";

declare const __DEV__: boolean;

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
    if (__DEV__) console.log('[Purchase] Starting:', pkg.product.identifier);

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
      return { success: true, isPremium: true, customerInfo };
    }

    // Purchase completed but no entitlement - still notify (test store scenario)
    await notifyPurchaseCompleted(deps.config, userId, pkg.product.identifier, customerInfo, source);
    clearSavedPurchase();
    return { success: true, isPremium: false, customerInfo };
  } catch (error) {
    if (isUserCancelledError(error)) {
      return { success: false, isPremium: false };
    }
    const errorMessage = getErrorMessage(error, "Purchase failed");
    throw new RevenueCatPurchaseError(errorMessage, pkg.product.identifier);
  }
}
