/**
 * Subscription Initializer
 */

import { Platform } from "react-native";
import type { CustomerInfo } from "react-native-purchases";
import type { CreditsConfig } from "../../domain/entities/Credits";
import { configureCreditsRepository, getCreditsRepository } from "../repositories/CreditsRepositoryProvider";
import { SubscriptionManager } from "../../revenuecat/infrastructure/managers/SubscriptionManager";
import { configureAuthProvider } from "../../presentation/hooks/useAuthAwarePurchase";
import type { RevenueCatData } from "../repositories/CreditsRepository";

export interface FirebaseAuthLike {
  currentUser: { uid: string; isAnonymous: boolean } | null;
  onAuthStateChanged: (callback: (user: { uid: string; isAnonymous: boolean } | null) => void) => () => void;
}

export interface CreditPackageConfig { identifierPattern?: string; amounts?: Record<string, number>; }

export interface SubscriptionInitConfig {
  apiKey?: string; apiKeyIos?: string; apiKeyAndroid?: string; testStoreKey?: string; entitlementId: string; credits: CreditsConfig;
  getAnonymousUserId: () => Promise<string>; getFirebaseAuth: () => FirebaseAuthLike | null; showAuthModal: () => void;
  onCreditsUpdated?: (userId: string) => void; creditPackages?: CreditPackageConfig; timeoutMs?: number; authStateTimeoutMs?: number;
}

const waitForAuthState = async (getAuth: () => FirebaseAuthLike | null, timeoutMs: number): Promise<string | undefined> => {
  const auth = getAuth();
  if (!auth) return undefined;
  if (auth.currentUser) return auth.currentUser.uid;
  return new Promise((resolve) => {
    const unsub = auth.onAuthStateChanged((u) => { unsub(); resolve(u?.uid); });
    setTimeout(() => { unsub(); resolve(undefined); }, timeoutMs);
  });
};

export const initializeSubscription = async (config: SubscriptionInitConfig): Promise<void> => {
  const { apiKey, apiKeyIos, apiKeyAndroid, testStoreKey, entitlementId, credits, getAnonymousUserId, getFirebaseAuth, showAuthModal, onCreditsUpdated, creditPackages, timeoutMs = 10000, authStateTimeoutMs = 2000 } = config;

  const key = Platform.OS === "ios" ? (apiKeyIos || apiKey || "") : (apiKeyAndroid || apiKey || "");
  if (!key) throw new Error("API key required");

  configureCreditsRepository({ ...credits, creditPackageAmounts: creditPackages?.amounts });

  const onPurchase = async (userId: string, productId: string, _customerInfo: unknown, source?: string) => {
    if (__DEV__) {
      console.log('[SubscriptionInitializer] onPurchase called:', { userId, productId, source });
    }
    try {
      const result = await getCreditsRepository().initializeCredits(
        userId,
        `purchase_${productId}_${Date.now()}`,
        productId,
        source as any
      );
      if (__DEV__) {
        console.log('[SubscriptionInitializer] Credits initialized:', result);
      }
      onCreditsUpdated?.(userId);
    } catch (error) {
      if (__DEV__) {
        console.error('[SubscriptionInitializer] Credits init failed:', error);
      }
    }
  };

  const onRenewal = async (userId: string, productId: string, _newExpirationDate: string, _customerInfo: unknown) => {
    if (__DEV__) {
      console.log('[SubscriptionInitializer] onRenewal called:', { userId, productId });
    }
    try {
      const result = await getCreditsRepository().initializeCredits(
        userId,
        `renewal_${productId}_${Date.now()}`,
        productId,
        "renewal" as any
      );
      if (__DEV__) {
        console.log('[SubscriptionInitializer] Credits reset on renewal:', result);
      }
      onCreditsUpdated?.(userId);
    } catch (error) {
      if (__DEV__) {
        console.error('[SubscriptionInitializer] Renewal credits init failed:', error);
      }
    }
  };

  SubscriptionManager.configure({
    config: { apiKey: key, testStoreKey, entitlementIdentifier: entitlementId, consumableProductIdentifiers: [creditPackages?.identifierPattern || "credit"], onPurchaseCompleted: onPurchase, onRenewalDetected: onRenewal, onCreditsUpdated },
    apiKey: key, getAnonymousUserId
  });

  const userId = await waitForAuthState(getFirebaseAuth, authStateTimeoutMs);
  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), timeoutMs));
  await Promise.race([SubscriptionManager.initialize(userId), timeout]);

  configureAuthProvider({
    isAuthenticated: () => {
      const u = getFirebaseAuth()?.currentUser;
      return !!(u && !u.isAnonymous);
    },
    showAuthModal,
  });
};
