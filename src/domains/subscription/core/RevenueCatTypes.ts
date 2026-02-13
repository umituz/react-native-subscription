/**
 * RevenueCat Type Definitions
 * Proper typing for RevenueCat entitlements and errors
 */

import type { CustomerInfo, PurchasesEntitlementInfo } from "react-native-purchases";
import { DEFAULT_ENTITLEMENT_ID } from "./SubscriptionConstants";

/**
 * Store type extracted from RevenueCat's PurchasesEntitlementInfo
 * Automatically stays in sync with RevenueCat SDK updates
 */
export type Store = PurchasesEntitlementInfo['store'];

/**
 * OwnershipType extracted from RevenueCat's PurchasesEntitlementInfo
 * Automatically stays in sync with RevenueCat SDK updates
 */
export type OwnershipType = PurchasesEntitlementInfo['ownershipType'];

/**
 * RevenueCat Entitlement Info
 * Represents active entitlement data from CustomerInfo
 */
export interface RevenueCatEntitlement {
  identifier: string;
  productIdentifier: string;
  isSandbox: boolean;
  willRenew: boolean;
  periodType: string;
  latestPurchaseDate: string | null;
  originalPurchaseDate: string | null;
  expirationDate: string | null;
  unsubscribeDetectedAt: string | null;
  billingIssueDetectedAt: string | null;
}

/**
 * RevenueCat Purchase Error with userCancelled flag
 */
export interface RevenueCatPurchaseErrorInfo extends Error {
  userCancelled?: boolean;
  code?: string;
  readableErrorCode?: string;
  underlyingErrorMessage?: string;
}

/**
 * Extract entitlement from CustomerInfo
 */
export function getPremiumEntitlement(
  customerInfo: CustomerInfo,
  entitlementIdentifier: string = DEFAULT_ENTITLEMENT_ID
): RevenueCatEntitlement | null {
  const entitlement = customerInfo.entitlements.active[entitlementIdentifier];
  if (!entitlement) {
    return null;
  }

  return {
    identifier: entitlement.identifier,
    productIdentifier: entitlement.productIdentifier,
    isSandbox: entitlement.isSandbox,
    willRenew: entitlement.willRenew,
    periodType: entitlement.periodType,
    latestPurchaseDate: entitlement.latestPurchaseDate,
    originalPurchaseDate: entitlement.originalPurchaseDate,
    expirationDate: entitlement.expirationDate,
    unsubscribeDetectedAt: entitlement.unsubscribeDetectedAt,
    billingIssueDetectedAt: entitlement.billingIssueDetectedAt,
  };
}

/**
 * Type guard for RevenueCat purchase error
 */
function isRevenueCatPurchaseError(error: unknown): error is RevenueCatPurchaseErrorInfo {
  return error instanceof Error && ("userCancelled" in error || "code" in error);
}

/**
 * Extract error code from RevenueCat error
 */
export function getErrorCode(error: unknown): string | null {
  if (!isRevenueCatPurchaseError(error)) {
    return null;
  }
  return error.code || error.readableErrorCode || null;
}

/**
 * Check if error is a user cancellation
 * Checks both userCancelled flag and PURCHASE_CANCELLED_ERROR code
 */
export function isUserCancelledError(error: unknown): boolean {
  if (!isRevenueCatPurchaseError(error)) {
    return false;
  }

  // Check userCancelled flag
  if (error.userCancelled === true) {
    return true;
  }

  // Check error code
  const code = getErrorCode(error);
  return code === "PURCHASE_CANCELLED_ERROR" || code === "1";
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  const code = getErrorCode(error);
  return code === "NETWORK_ERROR" || code === "7";
}

/**
 * Check if error is already purchased
 */
export function isAlreadyPurchasedError(error: unknown): boolean {
  const code = getErrorCode(error);
  return code === "PRODUCT_ALREADY_PURCHASED_ERROR" || code === "6";
}

/**
 * Check if error is invalid credentials
 */
export function isInvalidCredentialsError(error: unknown): boolean {
  const code = getErrorCode(error);
  return code === "INVALID_CREDENTIALS_ERROR" || code === "9";
}

/**
 * Extract error message safely
 * Returns user-friendly message if available, otherwise raw error message
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

