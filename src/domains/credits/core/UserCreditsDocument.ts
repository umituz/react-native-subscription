import type { 
  PurchaseSource, 
  PurchaseType, 
  SubscriptionStatusType, 
  PeriodType,
  PackageType,
  Platform
} from "../../subscription/core/SubscriptionConstants";

export type { 
  PurchaseSource, 
  PurchaseType, 
  SubscriptionStatusType, 
  PeriodType 
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
  appVersion?: string;
  timestamp: FirestoreTimestamp;
}

/** Single Source of Truth for user subscription data */
export interface UserCreditsDocumentRead {
    // Core subscription status
    isPremium?: boolean;
    status?: SubscriptionStatusType;

    // Dates (all from RevenueCat)
    purchasedAt?: FirestoreTimestamp;
    expirationDate?: FirestoreTimestamp;
    lastUpdatedAt?: FirestoreTimestamp;
    lastPurchaseAt?: FirestoreTimestamp;

    // RevenueCat subscription details
    willRenew?: boolean;
    productId?: string;
    packageType?: PackageType;
    originalTransactionId?: string;

    // Trial fields
    periodType?: PeriodType;
    isTrialing?: boolean;
    trialStartDate?: FirestoreTimestamp;
    trialEndDate?: FirestoreTimestamp;
    trialCredits?: number;
    convertedFromTrial?: boolean;

    // Credits
    credits: number;
    creditLimit?: number;

    // Metadata
    purchaseSource?: PurchaseSource;
    purchaseType?: PurchaseType;
    platform?: Platform;
    appVersion?: string;
    processedPurchases?: string[];
    purchaseHistory?: PurchaseMetadata[];
}
