import type { CreditsConfig } from "../../credits/core/Credits";
import type { UserCreditsDocumentRead } from "../../credits/core/UserCreditsDocument";
import type { PurchaseSource, PurchaseType } from "../core/SubscriptionConstants";
import type { SubscriptionMetadata } from "../core/types";

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
  apiKeyIos?: string;
  apiKeyAndroid?: string;
  entitlementId: string;
  credits: CreditsConfig;
  getAnonymousUserId: () => Promise<string>;
  getFirebaseAuth: () => FirebaseAuthLike | null;
  showAuthModal: () => void;
  onCreditsUpdated?: (userId: string) => void;
  creditPackages?: CreditPackageConfig;
  timeoutMs?: number;
  authStateTimeoutMs?: number;
}

export interface InitializeCreditsMetadata extends Omit<SubscriptionMetadata, 'willRenew'> {
  source: PurchaseSource;
  type: PurchaseType;
  willRenew: boolean | null;
  storeTransactionId: string | null;
  revenueCatUserId?: string | null;
}

export interface InitializationResult {
  credits: number;
  alreadyProcessed: boolean;
  finalData: UserCreditsDocumentRead | null;
}
