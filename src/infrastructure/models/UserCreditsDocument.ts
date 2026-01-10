
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

export interface PurchaseMetadata {
  productId: string;
  packageType: "weekly" | "monthly" | "yearly";
  creditLimit: number;
  source: PurchaseSource;
  type: PurchaseType;
  platform: "ios" | "android";
  appVersion?: string;
  timestamp: FirestoreTimestamp;
}

// Document structure when READING from Firestore
export interface UserCreditsDocumentRead {
    credits: number;
    packageType?: "weekly" | "monthly" | "yearly";
    creditLimit?: number;
    productId?: string;
    purchaseSource?: PurchaseSource;
    purchaseType?: PurchaseType;
    platform?: "ios" | "android";
    appVersion?: string;
    purchasedAt?: FirestoreTimestamp;
    lastUpdatedAt?: FirestoreTimestamp;
    lastPurchaseAt?: FirestoreTimestamp;
    processedPurchases?: string[];
    purchaseHistory?: PurchaseMetadata[];
}
