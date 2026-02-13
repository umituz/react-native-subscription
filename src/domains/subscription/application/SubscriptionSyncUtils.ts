import type { CustomerInfo } from "react-native-purchases";
import type { RevenueCatData } from "../../revenuecat/core/types";
import { PERIOD_TYPE, type PeriodType } from "../core/SubscriptionStatus";

function validatePeriodType(periodType: string | undefined): PeriodType | null {
  if (!periodType) return null;

  const validTypes: string[] = Object.values(PERIOD_TYPE);
  return validTypes.includes(periodType) ? (periodType as PeriodType) : null;
}

export const extractRevenueCatData = (customerInfo: CustomerInfo, entitlementId: string): RevenueCatData => {
  const entitlement = customerInfo.entitlements.active[entitlementId]
    ?? customerInfo.entitlements.all[entitlementId];

  return {
    expirationDate: entitlement?.expirationDate ?? customerInfo.latestExpirationDate ?? null,
    willRenew: entitlement?.willRenew ?? false,
    originalTransactionId: entitlement?.originalPurchaseDate ?? customerInfo.originalPurchaseDate ?? customerInfo.firstSeen,
    periodType: validatePeriodType(entitlement?.periodType),
    isPremium: !!customerInfo.entitlements.active[entitlementId],
    unsubscribeDetectedAt: entitlement?.unsubscribeDetectedAt ?? null,
    billingIssueDetectedAt: entitlement?.billingIssueDetectedAt ?? null,
    store: entitlement?.store ?? null,
    ownershipType: entitlement?.ownershipType ?? null,
  };
};
