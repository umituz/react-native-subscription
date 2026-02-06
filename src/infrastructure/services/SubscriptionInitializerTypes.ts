/**
 * Subscription Initializer Types
 */

import type { CreditsConfig } from "../../domain/entities/Credits";

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
}
