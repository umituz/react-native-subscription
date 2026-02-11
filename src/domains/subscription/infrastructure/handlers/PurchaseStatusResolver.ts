import type { CustomerInfo } from "react-native-purchases";
import { getPremiumEntitlement } from "../../core/RevenueCatTypes";
import { toDate } from "../../../../shared/utils/dateConverter";

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
        expirationDate: toDate(entitlement.expirationDate),
      };
    }

    return {
      isPremium: false,
      expirationDate: null,
    };
  }
}
