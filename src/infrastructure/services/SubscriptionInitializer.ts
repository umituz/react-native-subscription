/**
 * Subscription Initializer
 * Single entry point for subscription system initialization
 * Apps just call initializeSubscription with config
 */

import type { CreditsConfig } from "../../domain/entities/Credits";
import { configureCreditsRepository } from "../repositories/CreditsRepositoryProvider";
import { SubscriptionManager } from "../../revenuecat/infrastructure/managers/SubscriptionManager";
import { configureAuthProvider } from "../../presentation/hooks/useAuthAwarePurchase";

export interface FirebaseAuthLike {
  currentUser: { uid: string; isAnonymous: boolean } | null;
  onAuthStateChanged: (callback: (user: { uid: string; isAnonymous: boolean } | null) => void) => () => void;
}

export interface SubscriptionInitConfig {
  apiKey: string;
  testStoreKey?: string;
  entitlementId: string;
  credits: CreditsConfig;
  getAnonymousUserId: () => Promise<string>;
  getFirebaseAuth: () => FirebaseAuthLike | null;
  showAuthModal: () => void;
  onCreditsUpdated?: (userId: string) => void;
  onCreditRenewal?: (userId: string, productId: string, renewalId: string) => Promise<void>;
  timeoutMs?: number;
  authStateTimeoutMs?: number;
}

/**
 * Wait for Firebase Auth state to be ready
 * This prevents unnecessary logIn calls that trigger Apple Sign In dialog
 */
const waitForAuthState = async (
  getFirebaseAuth: () => FirebaseAuthLike | null,
  timeoutMs: number
): Promise<string | undefined> => {
  const auth = getFirebaseAuth();
  if (!auth) return undefined;

  // If user already available, return immediately
  if (auth.currentUser) {
    return auth.currentUser.uid;
  }

  // Wait for auth state to settle
  return new Promise<string | undefined>((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user?.uid || undefined);
    });

    // Timeout fallback - don't wait forever
    setTimeout(() => {
      unsubscribe();
      resolve(undefined);
    }, timeoutMs);
  });
};

export const initializeSubscription = async (
  config: SubscriptionInitConfig,
): Promise<void> => {
  const {
    apiKey,
    testStoreKey,
    entitlementId,
    credits,
    getAnonymousUserId,
    getFirebaseAuth,
    showAuthModal,
    onCreditsUpdated,
    onCreditRenewal,
    timeoutMs = 10000,
    authStateTimeoutMs = 2000,
  } = config;

  if (!apiKey) {
    throw new Error("RevenueCat API key is required");
  }

  configureCreditsRepository(credits);

  SubscriptionManager.configure({
    config: {
      apiKey,
      testStoreKey,
      entitlementIdentifier: entitlementId,
      onCreditRenewal,
      onCreditsUpdated,
    },
    apiKey,
    getAnonymousUserId,
  });

  // Wait for auth state to get correct user ID
  const initialUserId = await waitForAuthState(getFirebaseAuth, authStateTimeoutMs);

  const initPromise = SubscriptionManager.initialize(initialUserId);
  const timeoutPromise = new Promise<boolean>((_, reject) =>
    setTimeout(
      () => reject(new Error("Subscription initialization timeout")),
      timeoutMs,
    ),
  );

  await Promise.race([initPromise, timeoutPromise]);

  configureAuthProvider({
    isAuthenticated: () => {
      const auth = getFirebaseAuth();
      const user = auth?.currentUser;
      return !!(user && !user.isAnonymous);
    },
    showAuthModal,
  });
};
