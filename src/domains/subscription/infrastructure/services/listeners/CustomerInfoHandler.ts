import type { CustomerInfo } from "react-native-purchases";
import type { RevenueCatConfig } from "../../../../revenuecat/core/types/RevenueCatConfig";
import { syncPremiumStatus } from "../../utils/PremiumStatusSyncer";
import { detectRenewal } from "../../utils/renewal/RenewalDetector";
import { updateRenewalState } from "../../utils/renewal/RenewalStateUpdater";
import type { RenewalState } from "../../utils/renewal/types";
import { createLogger } from "../../../../../shared/utils/logger";

const logger = createLogger("CustomerInfoHandler");

async function handleRenewal(
  userId: string,
  productId: string,
  expirationDate: string,
  customerInfo: CustomerInfo,
  onRenewalDetected?: RevenueCatConfig['onRenewalDetected']
): Promise<void> {
  if (!onRenewalDetected) return;

  try {
    await onRenewalDetected({ userId, productId, newExpirationDate: expirationDate, customerInfo });
  } catch (error) {
    logger.error("Renewal callback failed", error, { userId, productId });
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
    await onPlanChanged({ userId, newProductId, previousProductId, isUpgrade, customerInfo });
  } catch (error) {
    logger.error("Plan change callback failed", error, { userId, newProductId, previousProductId, isUpgrade });
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
    logger.error("Premium status sync failed", error, { userId });
  }
}

export async function processCustomerInfo(
  customerInfo: CustomerInfo,
  userId: string,
  renewalState: RenewalState,
  config: RevenueCatConfig
): Promise<RenewalState> {
  logger.debug("processCustomerInfo called", {
    userId,
    renewalState,
    entitlementId: config.entitlementIdentifier,
    activeEntitlements: Object.keys(customerInfo.entitlements.active),
  });

  const renewalResult = detectRenewal(
    renewalState,
    customerInfo,
    config.entitlementIdentifier
  );

  if (renewalResult.isRenewal) {
    if (!renewalResult.productId || !renewalResult.newExpirationDate) {
      logger.error("Invalid renewal state: missing productId or expirationDate");
      return renewalState;
    }
    await handleRenewal(
      userId,
      renewalResult.productId,
      renewalResult.newExpirationDate,
      customerInfo,
      config.onRenewalDetected
    );
  }

  if (renewalResult.isPlanChange) {
    if (!renewalResult.productId || !renewalResult.previousProductId) {
      logger.error("Invalid plan change state: missing productId(s)");
      return renewalState;
    }
    await handlePlanChange(
      userId,
      renewalResult.productId,
      renewalResult.previousProductId,
      renewalResult.isUpgrade,
      customerInfo,
      config.onPlanChanged
    );
  }

  if (!renewalResult.isRenewal && !renewalResult.isPlanChange) {
    logger.debug("Handling premium status sync (new purchase or status update)");
    await handlePremiumStatusSync(config, userId, customerInfo);
  }

  return updateRenewalState(renewalResult);
}
