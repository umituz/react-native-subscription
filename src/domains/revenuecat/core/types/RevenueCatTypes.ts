import type { CustomerInfo, PurchasesEntitlementInfo, PurchasesPackage } from "react-native-purchases";

export type Store = PurchasesEntitlementInfo['store'];
export type OwnershipType = PurchasesEntitlementInfo['ownershipType'];
export type PackageType = PurchasesPackage['packageType'];

interface RevenueCatEntitlement {
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
  store: Store | null;
  ownershipType: OwnershipType | null;
}

interface RevenueCatPurchaseErrorInfo extends Error {
  userCancelled?: boolean;
  code?: string;
  readableErrorCode?: string;
  underlyingErrorMessage?: string;
}

export function getPremiumEntitlement(
  customerInfo: CustomerInfo,
  entitlementIdentifier: string
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
    store: entitlement.store ?? null,
    ownershipType: entitlement.ownershipType ?? null,
  };
}

function isRevenueCatPurchaseError(error: unknown): error is RevenueCatPurchaseErrorInfo {
  return error instanceof Error && ("userCancelled" in error || "code" in error);
}

export function getErrorCode(error: unknown): string | null {
  if (!isRevenueCatPurchaseError(error)) {
    return null;
  }
  return error.code || error.readableErrorCode || null;
}

export function isUserCancelledError(error: unknown): boolean {
  if (!isRevenueCatPurchaseError(error)) {
    return false;
  }
  if (error.userCancelled === true) {
    return true;
  }
  const code = getErrorCode(error);
  return code === "PURCHASE_CANCELLED_ERROR" || code === "1";
}

export function isNetworkError(error: unknown): boolean {
  const code = getErrorCode(error);
  return code === "NETWORK_ERROR" || code === "7";
}

export function isAlreadyPurchasedError(error: unknown): boolean {
  const code = getErrorCode(error);
  return code === "PRODUCT_ALREADY_PURCHASED_ERROR" || code === "6";
}

export function isInvalidCredentialsError(error: unknown): boolean {
  const code = getErrorCode(error);
  return code === "INVALID_CREDENTIALS_ERROR" || code === "9";
}

export function getRawErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}
