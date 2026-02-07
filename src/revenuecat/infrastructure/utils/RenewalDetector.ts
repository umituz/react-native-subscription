/**
 * Renewal Detector
 * Detects subscription renewals by tracking expiration date changes
 * Best Practice: Compare expiration dates to detect renewal events
 */

import type { CustomerInfo } from "react-native-purchases";
import { detectPackageType, type SubscriptionPackageType } from "../../../utils/packageTypeDetector";

export interface RenewalState {
  previousExpirationDate: string | null;
  previousProductId: string | null;
}

export interface RenewalDetectionResult {
  isRenewal: boolean;
  isPlanChange: boolean;
  isUpgrade: boolean;
  isDowngrade: boolean;
  productId: string | null;
  previousProductId: string | null;
  newExpirationDate: string | null;
}

const PACKAGE_TIER_ORDER: Record<SubscriptionPackageType, number> = {
  weekly: 1,
  monthly: 2,
  yearly: 3,
  unknown: 0,
};

function getPackageTier(productId: string | null): number {
  if (!productId) return 0;
  const packageType = detectPackageType(productId);
  return PACKAGE_TIER_ORDER[packageType] ?? 0;
}

/**
 * Detects if a subscription renewal or plan change occurred
 *
 * Best Practice (RevenueCat):
 * - Track previous expiration date
 * - If new expiration > previous → Renewal detected
 * - If productId changed → Plan change (upgrade/downgrade)
 * - Reset credits on renewal or plan change (industry standard)
 *
 * @param state Previous state (expiration date, product ID)
 * @param customerInfo Current CustomerInfo from RevenueCat
 * @param entitlementId Entitlement identifier to check
 * @returns Renewal detection result
 */
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

  // First time seeing this subscription - not a renewal
  if (!state.previousExpirationDate || !state.previousProductId) {
    return {
      ...baseResult,
      productId,
      newExpirationDate,
    };
  }

  if (!newExpirationDate) {
    // Lifetime subscription (no expiration) - not a renewal
    return {
      ...baseResult,
      productId,
      newExpirationDate,
    };
  }
  const newExpiration = new Date(newExpirationDate);
  const previousExpiration = new Date(state.previousExpirationDate);
  const productChanged = productId !== state.previousProductId;
  const expirationExtended = newExpiration > previousExpiration;

  // Plan change detection (upgrade/downgrade)
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

  // Same product renewal
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

/**
 * Updates renewal state after detection
 */
export function updateRenewalState(
  _state: RenewalState,
  result: RenewalDetectionResult
): RenewalState {
  return {
    previousExpirationDate: result.newExpirationDate,
    previousProductId: result.productId,
  };
}
