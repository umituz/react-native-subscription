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
  const savedPurchase = getSavedPurchase();
  const source = savedPurchase?.source;
  if (savedPurchase) {
    clearSavedPurchase();
  }

  await notifyPurchaseCompleted(config, userId, productId, customerInfo, source);

  return {
    success: true,
    isPremium: false,
    customerInfo,
    isConsumable: true,
    productId,
  };
}

declare const __DEV__: boolean;

async function executeSubscriptionPurchase(
  config: RevenueCatConfig,
  userId: string,
  productId: string,
  customerInfo: CustomerInfo,
  entitlementIdentifier: string
): Promise<PurchaseResult> {
  const isPremium = !!customerInfo.entitlements.active[entitlementIdentifier];
  const savedPurchase = getSavedPurchase();
  const source = savedPurchase?.source;
  if (savedPurchase) {
    clearSavedPurchase();
  }

  if (typeof __DEV__ !== "undefined" && __DEV__) {
    console.log("[PurchaseExecutor] executeSubscriptionPurchase:", {
      userId,
      productId,
      isPremium,
      entitlementIdentifier,
      activeEntitlements: Object.keys(customerInfo.entitlements.active),
      source,
    });
  }

  await syncPremiumStatus(config, userId, customerInfo);

  if (typeof __DEV__ !== "undefined" && __DEV__) {
    console.log("[PurchaseExecutor] syncPremiumStatus completed");
  }

  await notifyPurchaseCompleted(config, userId, productId, customerInfo, source);

  if (typeof __DEV__ !== "undefined" && __DEV__) {
    console.log("[PurchaseExecutor] Purchase flow completed successfully");
  }

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
  console.log('🔵 [PurchaseExecutor] executePurchase called', {
    productId: pkg.product.identifier,
    userId,
    isConsumable
  });

  console.log('🚀 [PurchaseExecutor] Calling Purchases.purchasePackage (RevenueCat SDK)');
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  console.log('✅ [PurchaseExecutor] Purchases.purchasePackage completed');

  const productId = pkg.product.identifier;

  if (isConsumable) {
    console.log('💰 [PurchaseExecutor] Processing as consumable purchase');
    return executeConsumablePurchase(config, userId, productId, customerInfo);
  }

  console.log('📅 [PurchaseExecutor] Processing as subscription purchase');
  return executeSubscriptionPurchase(
    config,
    userId,
    productId,
    customerInfo,
    config.entitlementIdentifier
  );
}
