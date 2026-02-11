import type { CustomerInfo } from "react-native-purchases";
import { getPremiumEntitlement } from "../../core/RevenueCatTypes";

export interface PremiumStatus {
  isPremium: boolean;
  expirationDate: Date | null;
}

export class PurchaseStatusResolver {
  static resolve(customerInfo: CustomerInfo, entitlementId: string): PremiumStatus {
    const entitlement = getPremiumEntitlement(customerInfo, entitlementId);

    if (entitlement) {
      let expirationDate: Date | null = null;

      if (entitlement.expirationDate) {
        const parsed = new Date(entitlement.expirationDate);
        expirationDate = isNaN(parsed.getTime()) ? null : parsed;
      }

      return {
        isPremium: true,
        expirationDate,
      };
    }

    return {
      isPremium: false,
      expirationDate: null,
    };
  }
}
