/**
 * Subscription Initializer Types
 */

import type { CreditsConfig } from "../../credits/core/Credits";
import type { UserCreditsDocumentRead } from "../../credits/core/UserCreditsDocument";
import type { PurchaseSource, PurchaseType } from "../core/SubscriptionConstants";
import type { PeriodType } from "../core/SubscriptionStatus";

export interface FirebaseAuthLike {
  currentUser: { uid: string; isAnonymous: boolean } | null;
  onAuthStateChanged: (callback: (user: { uid: string; isAnonymous: boolean } | null) => void) => () => void;
}

export interface CreditPackageConfig {
  identifierPattern?: string;
  amounts?: Record<string, number>;
}

export interface SubscriptionInitConfig {
  apiKey?: string;
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

export interface InitializeCreditsMetadata {
  productId?: string;
  source?: PurchaseSource;
  type?: PurchaseType;
  expirationDate?: string | null;
  willRenew?: boolean;
  originalTransactionId?: string;
  isPremium?: boolean;
  periodType?: PeriodType;
}

export interface InitializationResult {
    credits: number;
    alreadyProcessed?: boolean;
    finalData?: UserCreditsDocumentRead;
}
