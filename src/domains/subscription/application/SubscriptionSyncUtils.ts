import type { CustomerInfo } from "react-native-purchases";
import type { RevenueCatData } from "../core/RevenueCatData";
import { type PeriodType } from "../core/SubscriptionStatus";

export const extractRevenueCatData = (customerInfo: CustomerInfo, entitlementId: string): RevenueCatData => {
  const entitlement = customerInfo.entitlements.active[entitlementId]
    ?? customerInfo.entitlements.all[entitlementId];
    
  return {
    expirationDate: entitlement?.expirationDate ?? customerInfo.latestExpirationDate ?? null,
    willRenew: entitlement?.willRenew ?? false,
    originalTransactionId: entitlement?.originalPurchaseDate || customerInfo.firstSeen, 
    periodType: (entitlement?.periodType as PeriodType) ?? null,
    isPremium: !!customerInfo.entitlements.active[entitlementId],
  };
};
