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
  /**
   * @deprecated No longer used. Initialization is now non-blocking.
   * RevenueCat best practice: Use listener pattern instead of timeouts.
   */
  timeoutMs?: number;
  /**
   * @deprecated No longer used. Auth state is read synchronously.
   * Auth state changes are handled reactively via onAuthStateChanged listener.
   */
  authStateTimeoutMs?: number;
}
