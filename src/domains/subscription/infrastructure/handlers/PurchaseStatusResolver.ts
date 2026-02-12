import type { CustomerInfo } from "react-native-purchases";
import { getPremiumEntitlement } from "../../core/RevenueCatTypes";
import { toDate } from "../../../../shared/utils/dateConverter";

export interface PremiumStatus {
  isPremium: boolean;
  expirationDate: Date | null;
  willRenew: boolean;
  productIdentifier: string | null;
  originalPurchaseDate: Date | null;
  latestPurchaseDate: Date | null;
  billingIssuesDetected: boolean;
  isSandbox: boolean;
  periodType: string | null;
  store: string | null;
  gracePeriodExpiresDate: Date | null;
  unsubscribeDetectedAt: Date | null;
}

export class PurchaseStatusResolver {
  static resolve(customerInfo: CustomerInfo, entitlementId: string): PremiumStatus {
    const entitlement = getPremiumEntitlement(customerInfo, entitlementId);

    if (entitlement) {
      // Get the active subscription from customerInfo
      const activeSubscriptions = customerInfo.activeSubscriptions || [];
      const productId = entitlement.productIdentifier;
      const subscription = productId ? customerInfo.allPurchasedProductIdentifiers.includes(productId) : null;

      return {
        isPremium: true,
        expirationDate: toDate(entitlement.expirationDate),
        willRenew: entitlement.willRenew || false,
        productIdentifier: entitlement.productIdentifier || null,
        originalPurchaseDate: toDate(entitlement.originalPurchaseDate) || null,
        latestPurchaseDate: toDate(entitlement.latestPurchaseDate) || null,
        billingIssuesDetected: entitlement.billingIssueDetectedAt !== null && entitlement.billingIssueDetectedAt !== undefined,
        isSandbox: entitlement.isSandbox || false,
        periodType: entitlement.periodType || null,
        store: entitlement.store || null,
        gracePeriodExpiresDate: toDate(entitlement.gracePeriodExpiresDate) || null,
        unsubscribeDetectedAt: toDate(entitlement.unsubscribeDetectedAt) || null,
      };
    }

    return {
      isPremium: false,
      expirationDate: null,
      willRenew: false,
      productIdentifier: null,
      originalPurchaseDate: null,
      latestPurchaseDate: null,
      billingIssuesDetected: false,
      isSandbox: false,
      periodType: null,
      store: null,
      gracePeriodExpiresDate: null,
      unsubscribeDetectedAt: null,
    };
  }
}
