import type { Store, OwnershipType, PackageType } from "./RevenueCatTypes";

export interface RevenueCatData {
  expirationDate: string | null;
  willRenew: boolean | null;
  originalTransactionId: string | null;
  isPremium: boolean;
  periodType: string | null;
  packageType: PackageType | null;
  unsubscribeDetectedAt: string | null;
  billingIssueDetectedAt: string | null;
  store: Store | null;
  ownershipType: OwnershipType | null;
}
