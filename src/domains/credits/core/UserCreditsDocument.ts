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

export interface UserCreditsDocumentRead {
    isPremium: boolean;
    status: SubscriptionStatusType;
    purchasedAt: FirestoreTimestamp;
    expirationDate: FirestoreTimestamp | null;
    lastUpdatedAt: FirestoreTimestamp;
    lastPurchaseAt: FirestoreTimestamp | null;
    canceledAt: FirestoreTimestamp | null;
    billingIssueDetectedAt: FirestoreTimestamp | null;
    willRenew: boolean | null;
    productId: string | null;
    packageType: PackageType | null;
    originalTransactionId: string | null;
    store: Store | null;
    ownershipType: OwnershipType | null;
    periodType: string | null;
    credits: number;
    creditLimit: number;
    purchaseSource: PurchaseSource | null;
    purchaseType: PurchaseType | null;
    platform: Platform;
    appVersion: string | null;
    processedPurchases: string[];
    purchaseHistory: PurchaseMetadata[];
}
