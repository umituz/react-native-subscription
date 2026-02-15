import type { CustomerInfo } from "react-native-purchases";
import { getPremiumEntitlement } from "../../../revenuecat/core/types";
import { toDate } from "../../../../shared/utils/dateConverter";
import { detectPackageType } from "../../../../utils/packageTypeDetector";

declare const __DEV__: boolean;

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
  packageType: string | null;
  store: string | null;
  gracePeriodExpiresDate: Date | null;
  unsubscribeDetectedAt: Date | null;
}

export class PurchaseStatusResolver {
  static resolve(customerInfo: CustomerInfo, entitlementId: string): PremiumStatus {
    const entitlement = getPremiumEntitlement(customerInfo, entitlementId);

    if (entitlement) {
      const productIdentifier = entitlement.productIdentifier ?? null;
      const detectedPackageType = productIdentifier ? detectPackageType(productIdentifier) : null;

      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log("[PurchaseStatusResolver] productIdentifier:", productIdentifier);
        console.log("[PurchaseStatusResolver] detectedPackageType:", detectedPackageType);
      }

      return {
        isPremium: true,
        expirationDate: toDate(entitlement.expirationDate),
        willRenew: entitlement.willRenew ?? false,
        productIdentifier,
        originalPurchaseDate: toDate(entitlement.originalPurchaseDate) ?? null,
        latestPurchaseDate: toDate(entitlement.latestPurchaseDate) ?? null,
        billingIssuesDetected: entitlement.billingIssueDetectedAt !== null && entitlement.billingIssueDetectedAt !== undefined,
        isSandbox: entitlement.isSandbox ?? false,
        periodType: entitlement.periodType ?? null,
        packageType: detectedPackageType,
        store: null,
        gracePeriodExpiresDate: null,
        unsubscribeDetectedAt: toDate(entitlement.unsubscribeDetectedAt) ?? null,
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
      packageType: null,
      store: null,
      gracePeriodExpiresDate: null,
      unsubscribeDetectedAt: null,
    };
  }
}
