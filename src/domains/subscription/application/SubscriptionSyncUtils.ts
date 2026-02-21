import type { CustomerInfo } from "react-native-purchases";
import type { RevenueCatData } from "../../revenuecat/core/types";
import { PERIOD_TYPE, type PeriodType } from "../core/SubscriptionConstants";

function validatePeriodType(periodType: string | undefined): PeriodType | null {
  if (!periodType) return null;

  const validTypes: string[] = Object.values(PERIOD_TYPE);
  return validTypes.includes(periodType) ? (periodType as PeriodType) : null;
}

export const extractRevenueCatData = (customerInfo: CustomerInfo, entitlementId: string): RevenueCatData => {
  if (!customerInfo) {
    throw new Error('[extractRevenueCatData] customerInfo is required');
  }
  if (!entitlementId) {
    throw new Error('[extractRevenueCatData] entitlementId is required');
  }

  const entitlement = customerInfo.entitlements.active[entitlementId];

  const isPremium = !!customerInfo.entitlements.active[entitlementId];

  if (!entitlement) {
    return {
      expirationDate: null,
      willRenew: null,
      originalTransactionId: null,
      periodType: null,
      packageType: null,
      isPremium: false,
      unsubscribeDetectedAt: null,
      billingIssueDetectedAt: null,
      store: null,
      ownershipType: null,
    };
  }

  return {
    expirationDate: entitlement.expirationDate ?? null,
    willRenew: entitlement.willRenew ?? null,
    originalTransactionId: entitlement.originalPurchaseDate ?? null,
    periodType: validatePeriodType(entitlement.periodType),
    packageType: null,
    isPremium,
    unsubscribeDetectedAt: entitlement.unsubscribeDetectedAt ?? null,
    billingIssueDetectedAt: entitlement.billingIssueDetectedAt ?? null,
    store: entitlement.store ?? null,
    ownershipType: entitlement.ownershipType ?? null,
  };
};
