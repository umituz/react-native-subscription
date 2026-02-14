import Purchases, { type PurchasesPackage, type CustomerInfo } from "react-native-purchases";
import type { PurchaseResult } from "../../../../../shared/application/ports/IRevenueCatService";
import type { RevenueCatConfig } from "../../../../revenuecat/core/types";
import { syncPremiumStatus, notifyPurchaseCompleted } from "../../utils/PremiumStatusSyncer";
import { getSavedPurchase, clearSavedPurchase } from "../../../presentation/useAuthAwarePurchase";

async function executeConsumablePurchase(
  config: RevenueCatConfig,
  userId: string,
  productId: string,
  customerInfo: CustomerInfo
): Promise<PurchaseResult> {
  const source = getSavedPurchase()?.source;
  await notifyPurchaseCompleted(config, userId, productId, customerInfo, source);
  clearSavedPurchase();
  return {
    success: true,
    isPremium: false,
    customerInfo,
    isConsumable: true,
    productId,
  };
}

async function executeSubscriptionPurchase(
  config: RevenueCatConfig,
  userId: string,
  productId: string,
  customerInfo: CustomerInfo,
  entitlementIdentifier: string
): Promise<PurchaseResult> {
  const isPremium = !!customerInfo.entitlements.active[entitlementIdentifier];
  const source = getSavedPurchase()?.source;

  if (isPremium) {
    await syncPremiumStatus(config, userId, customerInfo);
  }

  await notifyPurchaseCompleted(config, userId, productId, customerInfo, source);
  clearSavedPurchase();

  return {
    success: true,
    isPremium,
    customerInfo,
    productId,
  };
}

export async function executePurchase(
  config: RevenueCatConfig,
  userId: string,
  pkg: PurchasesPackage,
  isConsumable: boolean
): Promise<PurchaseResult> {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  const productId = pkg.product.identifier;

  if (isConsumable) {
    return executeConsumablePurchase(config, userId, productId, customerInfo);
  }

  return executeSubscriptionPurchase(
    config,
    userId,
    productId,
    customerInfo,
    config.entitlementIdentifier
  );
}
