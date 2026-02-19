import type { CustomerInfo } from "react-native-purchases";
import type { RenewalState, RenewalDetectionResult } from "./types";
import { getPackageTier } from "./PackageTierComparator";

export function detectRenewal(
  state: RenewalState,
  customerInfo: CustomerInfo,
  entitlementId: string
): RenewalDetectionResult {
  const entitlement = customerInfo.entitlements.active[entitlementId];

  const baseResult: RenewalDetectionResult = {
    isRenewal: false,
    isPlanChange: false,
    isUpgrade: false,
    isDowngrade: false,
    productId: null,
    previousProductId: state.previousProductId,
    newExpirationDate: null,
  };

  if (!entitlement) {
    return baseResult;
  }

  const newExpirationDate = entitlement.expirationDate;
  const productId = entitlement.productIdentifier;

  if (!state.previousExpirationDate || !state.previousProductId) {
    return {
      ...baseResult,
      productId,
      newExpirationDate,
    };
  }

  if (!newExpirationDate) {
    return {
      ...baseResult,
      productId,
      newExpirationDate,
    };
  }

  const newExpiration = new Date(newExpirationDate).getTime();
  const previousExpiration = new Date(state.previousExpirationDate).getTime();
  const productChanged = productId !== state.previousProductId;

  // Guard against NaN from invalid date strings - treat as no extension
  const expirationExtended =
    !isNaN(newExpiration) && !isNaN(previousExpiration) && newExpiration > previousExpiration;

  if (productChanged) {
    const oldTier = getPackageTier(state.previousProductId);
    const newTier = getPackageTier(productId);
    const isUpgrade = newTier > oldTier;
    const isDowngrade = newTier < oldTier;

    return {
      isRenewal: false,
      isPlanChange: true,
      isUpgrade,
      isDowngrade,
      productId,
      previousProductId: state.previousProductId,
      newExpirationDate,
    };
  }

  const isRenewal = expirationExtended;

  return {
    isRenewal,
    isPlanChange: false,
    isUpgrade: false,
    isDowngrade: false,
    productId,
    previousProductId: state.previousProductId,
    newExpirationDate,
  };
}
