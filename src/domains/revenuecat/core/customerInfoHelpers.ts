/**
 * Customer Info Helper Functions
 * Utilities for extracting data from RevenueCat CustomerInfo objects
 */

import type { CustomerInfo } from "react-native-purchases";

/**
 * Extracts active entitlement IDs from CustomerInfo
 * Useful for logging and debugging
 *
 * @param customerInfo - RevenueCat CustomerInfo object
 * @returns Array of active entitlement IDs
 *
 * @example
 * const activeIds = getActiveEntitlementIds(customerInfo);
 * console.log("Active entitlements:", activeIds); // ["premium", "pro_features"]
 */
export function getActiveEntitlementIds(customerInfo: CustomerInfo): string[] {
  return Object.keys(customerInfo.entitlements.active);
}
