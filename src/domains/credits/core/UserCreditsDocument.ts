import type {
  PurchaseSource,
  PurchaseType,
  SubscriptionStatusType,
  PackageType,
  Platform
} from "../../subscription/core/SubscriptionConstants";
import type { Store, OwnershipType } from "../../revenuecat/core/types";

export type {
  PurchaseSource,
  PurchaseType,
  SubscriptionStatusType,
  Store,
  OwnershipType
};

export interface FirestoreTimestamp {
    toDate: () => Date;
}

export interface PurchaseMetadata {
  productId: string;
  packageType: PackageType;
  creditLimit: number;
  source: PurchaseSource;
  type: PurchaseType;
  platform: Platform;
  appVersion: string;
  timestamp: FirestoreTimestamp;
}

/** Single Source of Truth for user subscription data */
export interface UserCreditsDocumentRead {
    // Core subscription status
    isPremium: boolean;
    status: SubscriptionStatusType;

    // Dates (all from RevenueCat)
    purchasedAt: FirestoreTimestamp;
    expirationDate: FirestoreTimestamp | null;
    lastUpdatedAt: FirestoreTimestamp;
    lastPurchaseAt: FirestoreTimestamp | null;
    canceledAt: FirestoreTimestamp | null;
    billingIssueDetectedAt: FirestoreTimestamp | null;

    // RevenueCat subscription details
    willRenew: boolean | null;
    productId: string | null;
    packageType: PackageType | null;
    originalTransactionId: string | null;
    store: Store | null;
    ownershipType: OwnershipType | null;

    // Trial fields
    periodType: string | null;
    isTrialing: boolean | null;
    trialStartDate: FirestoreTimestamp | null;
    trialEndDate: FirestoreTimestamp | null;
    trialCredits: number | null;
    convertedFromTrial: boolean | null;

    // Credits
    credits: number;
    creditLimit: number;

    // Metadata
    purchaseSource: PurchaseSource | null;
    purchaseType: PurchaseType | null;
    platform: Platform;
    appVersion: string | null;
    processedPurchases: string[];
    purchaseHistory: PurchaseMetadata[];
}
