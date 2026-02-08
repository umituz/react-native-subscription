import type { CustomerInfo } from "react-native-purchases";
import type { RevenueCatData } from "../core/RevenueCatData";
import { type PeriodType } from "../core/SubscriptionStatus";

/** Extract RevenueCat data from CustomerInfo (Single Source of Truth) */
export const extractRevenueCatData = (customerInfo: CustomerInfo, entitlementId: string): RevenueCatData => {
  const entitlement = customerInfo.entitlements.active[entitlementId]
    ?? customerInfo.entitlements.all[entitlementId];
    
  return {
    expirationDate: entitlement?.expirationDate ?? customerInfo.latestExpirationDate ?? null,
    willRenew: entitlement?.willRenew ?? false,
    // Use latestPurchaseDate if originalPurchaseDate is missing, or a combine id
    originalTransactionId: entitlement?.originalPurchaseDate || customerInfo.firstSeen, 
    periodType: entitlement?.periodType as PeriodType | undefined,
    isPremium: !!customerInfo.entitlements.active[entitlementId],
  };
};
