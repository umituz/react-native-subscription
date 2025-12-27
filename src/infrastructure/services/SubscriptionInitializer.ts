/**
 * Subscription Initializer
 * Single entry point for subscription system initialization
 * Apps just call initializeSubscription with config
 */

import type { CreditsConfig } from "../../domain/entities/Credits";
import { configureCreditsRepository } from "../repositories/CreditsRepositoryProvider";
import { SubscriptionManager } from "../../revenuecat/infrastructure/managers/SubscriptionManager";
import { configureAuthProvider } from "../../presentation/hooks/useAuthAwarePurchase";

export interface SubscriptionInitConfig {
  apiKey: string;
  entitlementId: string;
  credits: CreditsConfig;
  getAnonymousUserId: () => Promise<string>;
  getFirebaseAuth: () => { currentUser: { isAnonymous: boolean } | null } | null;
  showAuthModal: () => void;
  onCreditsUpdated?: (userId: string) => void;
  onCreditRenewal?: (userId: string, productId: string, renewalId: string) => Promise<void>;
  timeoutMs?: number;
}

export const initializeSubscription = async (
  config: SubscriptionInitConfig,
): Promise<void> => {
  const {
    apiKey,
    entitlementId,
    credits,
    getAnonymousUserId,
    getFirebaseAuth,
    showAuthModal,
    onCreditsUpdated,
    onCreditRenewal,
    timeoutMs = 10000,
  } = config;

  if (!apiKey) {
    throw new Error("RevenueCat API key is required");
  }

  configureCreditsRepository(credits);

  SubscriptionManager.configure({
    config: {
      apiKey,
      entitlementIdentifier: entitlementId,
      onCreditRenewal,
      onCreditsUpdated,
    },
    apiKey,
    getAnonymousUserId,
  });

  const initPromise = SubscriptionManager.initialize();
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

  if (__DEV__) {
     
    console.log("[Subscription] Initialized successfully");
  }
};
