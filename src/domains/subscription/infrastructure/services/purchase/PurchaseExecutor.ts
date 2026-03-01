import Purchases, { type PurchasesPackage, type CustomerInfo } from "react-native-purchases";
import type { PurchaseResult } from "../../../../../shared/application/ports/IRevenueCatService";
import type { RevenueCatConfig, PackageType } from "../../../../revenuecat/core/types";
import { notifyPurchaseCompleted, syncPremiumStatus } from "../../utils/PremiumStatusSyncer";
import { getSavedPurchase, clearSavedPurchase } from "../../../presentation/useAuthAwarePurchase";

async function attemptRecovery(config: RevenueCatConfig, userId: string, customerInfo: CustomerInfo): Promise<void> {
  try {
    console.warn('[PurchaseExecutor] Attempting recovery via syncPremiumStatus...');
    await syncPremiumStatus(config, userId, customerInfo);
  } catch (recoveryError) {
    console.error('[PurchaseExecutor] Recovery also failed:', recoveryError);
  }
}

async function executeConsumablePurchase(
  config: RevenueCatConfig,
  userId: string,
  productId: string,
  customerInfo: CustomerInfo,
  packageType: PackageType | null
): Promise<PurchaseResult> {
  const savedPurchase = getSavedPurchase();
  const source = savedPurchase?.source;

  try {
    await notifyPurchaseCompleted(config, userId, productId, customerInfo, source, packageType);
  } catch (syncError) {
    console.error('[PurchaseExecutor] Post-purchase sync failed, attempting recovery:', syncError);
    await attemptRecovery(config, userId, customerInfo);
  } finally {
    if (savedPurchase) {
      clearSavedPurchase();
    }
  }

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
  entitlementIdentifier: string,
  packageType: PackageType | null
): Promise<PurchaseResult> {
  const isPremium = !!customerInfo.entitlements.active[entitlementIdentifier];
  const savedPurchase = getSavedPurchase();
  const source = savedPurchase?.source;

  if (typeof __DEV__ !== "undefined" && __DEV__) {
    console.log("[PurchaseExecutor] executeSubscriptionPurchase:", {
      userId,
      productId,
      isPremium,
      entitlementIdentifier,
      activeEntitlements: Object.keys(customerInfo.entitlements.active),
      source,
      packageType,
    });
  }

  try {
    await notifyPurchaseCompleted(config, userId, productId, customerInfo, source, packageType);
  } catch (syncError) {
    console.error('[PurchaseExecutor] Post-purchase sync failed, attempting recovery:', syncError);
    await attemptRecovery(config, userId, customerInfo);
  } finally {
    if (savedPurchase) {
      clearSavedPurchase();
    }
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
  const { customerInfo } = await Purchases.purchasePackage(pkg);

  const productId = pkg.product.identifier;
  const packageType = pkg.packageType ?? null;

  if (isConsumable) {
    return executeConsumablePurchase(config, userId, productId, customerInfo, packageType);
  }

  return executeSubscriptionPurchase(
    config,
    userId,
    productId,
    customerInfo,
    config.entitlementIdentifier,
    packageType
  );
}
