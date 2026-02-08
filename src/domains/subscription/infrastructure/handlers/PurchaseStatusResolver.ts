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
      return {
        isPremium: true,
        expirationDate: entitlement.expirationDate
          ? new Date(entitlement.expirationDate)
          : null,
      };
    }

    return {
      isPremium: false,
      expirationDate: null,
    };
  }
}
