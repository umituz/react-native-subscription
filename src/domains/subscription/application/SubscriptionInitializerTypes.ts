import type { CreditsConfig } from "../../credits/core/Credits";
import type { UserCreditsDocumentRead } from "../../credits/core/UserCreditsDocument";
import type { PurchaseSource, PurchaseType } from "../core/SubscriptionConstants";
import type { Store, OwnershipType } from "../../revenuecat/core/types";

export interface FirebaseAuthLike {
  currentUser: { uid: string; isAnonymous: boolean } | null;
  onAuthStateChanged: (callback: (user: { uid: string; isAnonymous: boolean } | null) => void) => () => void;
}

export interface CreditPackageConfig {
  identifierPattern: string;
  amounts: Record<string, number>;
}

export interface SubscriptionInitConfig {
  apiKey: string;
  apiKeyIos: string;
  apiKeyAndroid: string;
  entitlementId: string;
  credits: CreditsConfig;
  getAnonymousUserId: () => Promise<string>;
  getFirebaseAuth: () => FirebaseAuthLike | null;
  showAuthModal: () => void;
  onCreditsUpdated: (userId: string) => void;
  creditPackages: CreditPackageConfig;
  timeoutMs: number;
  authStateTimeoutMs: number;
}

export interface InitializeCreditsMetadata {
  productId: string;
  source: PurchaseSource;
  type: PurchaseType;
  expirationDate: string | null;
  willRenew: boolean | null;
  originalTransactionId: string | null;
  isPremium: boolean;
  periodType: string | null;
  unsubscribeDetectedAt: string | null;
  billingIssueDetectedAt: string | null;
  store: Store | null;
  ownershipType: OwnershipType | null;
  revenueCatUserId?: string | null;
}

export interface InitializationResult {
  credits: number;
  alreadyProcessed: boolean;
  finalData: UserCreditsDocumentRead | null;
}
