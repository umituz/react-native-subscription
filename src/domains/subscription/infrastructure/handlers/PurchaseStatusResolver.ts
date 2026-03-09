import type { CustomerInfo } from "react-native-purchases";
import { getPremiumEntitlement } from "../../../revenuecat/core/types";
import { toDate } from "../../../../shared/utils/dateConverter";
import { detectPackageType } from "../../../../utils/packageTypeDetector";
import type { PremiumStatus } from "../../core/types";

export type { PremiumStatus };

export class PurchaseStatusResolver {
  static resolve(customerInfo: CustomerInfo, entitlementId: string): PremiumStatus {
    const entitlement = getPremiumEntitlement(customerInfo, entitlementId);

    if (entitlement) {
      const productIdentifier = entitlement.productIdentifier ?? null;
      const detectedPackageType = productIdentifier ? detectPackageType(productIdentifier) : null;

      return {
        isPremium: true,
        expirationDate: toDate(entitlement.expirationDate),
        willRenew: entitlement.willRenew ?? false,
        productIdentifier,
        originalPurchaseDate: toDate(entitlement.originalPurchaseDate),
        latestPurchaseDate: toDate(entitlement.latestPurchaseDate),
        billingIssuesDetected: entitlement.billingIssueDetectedAt !== null && entitlement.billingIssueDetectedAt !== undefined,
        isSandbox: entitlement.isSandbox ?? false,
        periodType: entitlement.periodType ?? null,
        packageType: detectedPackageType,
        store: entitlement.store ?? null,
        gracePeriodExpiresDate: null,
        unsubscribeDetectedAt: toDate(entitlement.unsubscribeDetectedAt),
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
