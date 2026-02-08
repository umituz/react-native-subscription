import type { CustomerInfo } from "react-native-purchases";
import type { RevenueCatData } from "../../domain/types/RevenueCatData";
import { type PeriodType } from "../../domain/entities/SubscriptionConstants";

/** Extract RevenueCat data from CustomerInfo (Single Source of Truth) */
export const extractRevenueCatData = (customerInfo: CustomerInfo, entitlementId: string): RevenueCatData => {
  const entitlement = customerInfo.entitlements.active[entitlementId]
    ?? customerInfo.entitlements.all[entitlementId];
    
  return {
    expirationDate: entitlement?.expirationDate ?? customerInfo.latestExpirationDate ?? null,
    willRenew: entitlement?.willRenew ?? false,
    originalTransactionId: entitlement?.originalPurchaseDate ?? undefined,
    periodType: entitlement?.periodType as PeriodType | undefined,
  };
};
