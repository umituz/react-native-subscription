/**
 * Renewal Detector
 * Detects subscription renewals by tracking expiration date changes
 * Best Practice: Compare expiration dates to detect renewal events
 */

import type { CustomerInfo } from "react-native-purchases";

export interface RenewalState {
  previousExpirationDate: string | null;
  previousProductId: string | null;
}

export interface RenewalDetectionResult {
  isRenewal: boolean;
  productId: string | null;
  newExpirationDate: string | null;
}

/**
 * Detects if a subscription renewal occurred
 *
 * Best Practice (RevenueCat):
 * - Track previous expiration date
 * - If new expiration > previous → Renewal detected
 * - Reset credits on renewal (industry standard)
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

  if (!entitlement) {
    return {
      isRenewal: false,
      productId: null,
      newExpirationDate: null,
    };
  }

  const newExpirationDate = entitlement.expirationDate;
  const productId = entitlement.productIdentifier;

  if (!newExpirationDate || !state.previousExpirationDate) {
    return {
      isRenewal: false,
      productId,
      newExpirationDate,
    };
  }

  const newExpiration = new Date(newExpirationDate);
  const previousExpiration = new Date(state.previousExpirationDate);

  const isRenewal = newExpiration > previousExpiration &&
                    productId === state.previousProductId;

  return {
    isRenewal,
    productId,
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
