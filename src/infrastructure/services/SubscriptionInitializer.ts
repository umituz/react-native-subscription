/**
 * Subscription Initializer
 * Single entry point for subscription system initialization
 * Apps just call initializeSubscription with config
 */

import type { CustomerInfo } from "react-native-purchases";
import type { CreditsConfig } from "../../domain/entities/Credits";
import { configureCreditsRepository, getCreditsRepository } from "../repositories/CreditsRepositoryProvider";
import { SubscriptionManager } from "../../revenuecat/infrastructure/managers/SubscriptionManager";
import { configureAuthProvider } from "../../presentation/hooks/useAuthAwarePurchase";

export interface FirebaseAuthLike {
  currentUser: { uid: string; isAnonymous: boolean } | null;
  onAuthStateChanged: (callback: (user: { uid: string; isAnonymous: boolean } | null) => void) => () => void;
}

export interface CreditPackageConfig {
  /** Identifier pattern to match credit packages (e.g., "credit") */
  identifierPattern?: string;
  /** Map of productId to credit amounts */
  amounts?: Record<string, number>;
}

export interface SubscriptionInitConfig {
  apiKey: string;
  testStoreKey?: string;
  entitlementId: string;
  credits: CreditsConfig;
  getAnonymousUserId: () => Promise<string>;
  getFirebaseAuth: () => FirebaseAuthLike | null;
  showAuthModal: () => void;
  /** Callback after credits are updated (for cache invalidation) */
  onCreditsUpdated?: (userId: string) => void;
  /** Credit package configuration for consumable purchases */
  creditPackages?: CreditPackageConfig;
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

/**
 * Check if a product is a credit package
 */
const isCreditPackage = (productId: string, pattern?: string): boolean => {
  const patternToUse = pattern || "credit";
  return productId.toLowerCase().includes(patternToUse.toLowerCase());
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
    creditPackages,
    timeoutMs = 10000,
    authStateTimeoutMs = 2000,
  } = config;

  if (!apiKey) {
    throw new Error("RevenueCat API key is required");
  }

  // Merge credit package amounts into credits config
  const creditsConfigWithPackages = {
    ...credits,
    creditPackageAmounts: creditPackages?.amounts,
  };
  configureCreditsRepository(creditsConfigWithPackages);

  // Build consumable product identifiers from credit package pattern
  const consumableIdentifiers: string[] = [];
  if (creditPackages?.identifierPattern) {
    consumableIdentifiers.push(creditPackages.identifierPattern);
  } else {
    consumableIdentifiers.push("credit");
  }

  // Create onPurchaseCompleted handler for credit packages
  const handlePurchaseCompleted = async (
    userId: string,
    productId: string,
    _customerInfo: CustomerInfo
  ): Promise<void> => {
    const isCredit = isCreditPackage(productId, creditPackages?.identifierPattern);

    if (!isCredit) {
      return;
    }

    try {
      const repository = getCreditsRepository();
      const purchaseId = `purchase_${productId}_${Date.now()}`;

      await repository.initializeCredits(userId, purchaseId, productId);

      if (__DEV__) {
        console.log("[SubscriptionInitializer] Credits added for purchase:", {
          userId,
          productId,
          purchaseId,
        });
      }

      if (onCreditsUpdated) {
        onCreditsUpdated(userId);
      }
    } catch (error) {
      if (__DEV__) {
        console.error("[SubscriptionInitializer] Failed to add credits:", error);
      }
    }
  };

  // Create onCreditRenewal handler for subscription renewals
  const handleCreditRenewal = async (
    userId: string,
    productId: string,
    renewalId: string
  ): Promise<void> => {
    try {
      const repository = getCreditsRepository();
      await repository.initializeCredits(userId, renewalId, productId);

      if (__DEV__) {
        console.log("[SubscriptionInitializer] Credits renewed:", {
          userId,
          productId,
          renewalId,
        });
      }

      if (onCreditsUpdated) {
        onCreditsUpdated(userId);
      }
    } catch (error) {
      if (__DEV__) {
        console.error("[SubscriptionInitializer] Failed to renew credits:", error);
      }
    }
  };

  SubscriptionManager.configure({
    config: {
      apiKey,
      testStoreKey,
      entitlementIdentifier: entitlementId,
      consumableProductIdentifiers: consumableIdentifiers,
      onCreditRenewal: handleCreditRenewal,
      onCreditsUpdated,
      onPurchaseCompleted: handlePurchaseCompleted,
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
