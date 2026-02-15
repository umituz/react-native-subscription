import type { CustomerInfo } from "react-native-purchases";
import type { RevenueCatConfig } from "../../../../revenuecat/core/types";
import { syncPremiumStatus } from "../../utils/PremiumStatusSyncer";
import { detectRenewal, updateRenewalState, type RenewalState } from "../../utils/renewal";

async function handleRenewal(
  userId: string,
  productId: string,
  expirationDate: string,
  customerInfo: CustomerInfo,
  onRenewalDetected?: RevenueCatConfig['onRenewalDetected']
): Promise<void> {
  if (!onRenewalDetected) return;

  try {
    await onRenewalDetected(userId, productId, expirationDate, customerInfo);
  } catch (error) {
    console.error('[CustomerInfoHandler] Renewal detection callback failed', {
      userId,
      productId,
      error
    });
  }
}

async function handlePlanChange(
  userId: string,
  newProductId: string,
  previousProductId: string,
  isUpgrade: boolean,
  customerInfo: CustomerInfo,
  onPlanChanged?: RevenueCatConfig['onPlanChanged']
): Promise<void> {
  if (!onPlanChanged) return;

  try {
    await onPlanChanged(userId, newProductId, previousProductId, isUpgrade, customerInfo);
  } catch (error) {
    console.error('[CustomerInfoHandler] Plan change callback failed', {
      userId,
      newProductId,
      previousProductId,
      isUpgrade,
      error
    });
  }
}

async function handlePremiumStatusSync(
  config: RevenueCatConfig,
  userId: string,
  customerInfo: CustomerInfo
): Promise<void> {
  try {
    await syncPremiumStatus(config, userId, customerInfo);
  } catch (error) {
    console.error('[CustomerInfoHandler] Premium status sync failed', {
      userId,
      error
    });
  }
}

export async function processCustomerInfo(
  customerInfo: CustomerInfo,
  userId: string,
  renewalState: RenewalState,
  config: RevenueCatConfig
): Promise<RenewalState> {
  const renewalResult = detectRenewal(
    renewalState,
    customerInfo,
    config.entitlementIdentifier
  );

  if (renewalResult.isRenewal) {
    await handleRenewal(
      userId,
      renewalResult.productId!,
      renewalResult.newExpirationDate!,
      customerInfo,
      config.onRenewalDetected
    );
  }

  if (renewalResult.isPlanChange) {
    await handlePlanChange(
      userId,
      renewalResult.productId!,
      renewalResult.previousProductId!,
      renewalResult.isUpgrade,
      customerInfo,
      config.onPlanChanged
    );
  }

  if (!renewalResult.isRenewal && !renewalResult.isPlanChange) {
    await handlePremiumStatusSync(config, userId, customerInfo);
  }

  return updateRenewalState(renewalState, renewalResult);
}
