import type { PurchaseSource, PurchaseType } from "../../domain/entities/Credits";
import type { SubscriptionStatusType, PeriodType } from "../../domain/entities/SubscriptionStatus";

export type { PurchaseSource, PurchaseType } from "../../domain/entities/Credits";
export type { SubscriptionStatusType, PeriodType } from "../../domain/entities/SubscriptionStatus";

export interface FirestoreTimestamp {
    toDate: () => Date;
}

export interface PurchaseMetadata {
  productId: string;
  packageType: "weekly" | "monthly" | "yearly" | "lifetime";
  creditLimit: number;
  source: PurchaseSource;
  type: PurchaseType;
  platform: "ios" | "android";
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
    packageType?: "weekly" | "monthly" | "yearly" | "lifetime";
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
    platform?: "ios" | "android";
    appVersion?: string;
    processedPurchases?: string[];
    purchaseHistory?: PurchaseMetadata[];
}
