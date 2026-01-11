export interface FirestoreTimestamp {
    toDate: () => Date;
}

export type PurchaseSource =
  | "onboarding"
  | "settings"
  | "upgrade_prompt"
  | "home_screen"
  | "feature_gate"
  | "credits_exhausted";

export type PurchaseType = "initial" | "renewal" | "upgrade" | "downgrade";

export type SubscriptionDocStatus = "active" | "expired" | "canceled" | "free";

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
    status?: SubscriptionDocStatus;

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
