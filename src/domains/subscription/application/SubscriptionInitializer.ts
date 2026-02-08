/**
 * Subscription Initializer
 *
 * Uses RevenueCat best practices:
 * - Non-blocking initialization (fire and forget)
 * - Relies on CustomerInfoUpdateListener for state updates
 */

import { Platform } from "react-native";
import { configureCreditsRepository } from "../../credits/infrastructure/CreditsRepositoryProvider";
import { SubscriptionManager } from "../infrastructure/managers/SubscriptionManager";
import { configureAuthProvider } from "../presentation/useAuthAwarePurchase";
import { SubscriptionSyncService } from "./SubscriptionSyncService";
import { getCurrentUserId, setupAuthStateListener } from "./SubscriptionAuthListener";
import type { SubscriptionInitConfig } from "./SubscriptionInitializerTypes";

export type { FirebaseAuthLike, CreditPackageConfig, SubscriptionInitConfig } from "./SubscriptionInitializerTypes";

export const initializeSubscription = async (config: SubscriptionInitConfig): Promise<void> => {
  const {
    apiKey, apiKeyIos, apiKeyAndroid, entitlementId, credits,
    getAnonymousUserId, getFirebaseAuth, showAuthModal,
    onCreditsUpdated, creditPackages,
  } = config;

  const key = Platform.OS === 'ios' ? (apiKeyIos || apiKey || '') : (apiKeyAndroid || apiKey || '');
  if (!key) throw new Error('API key required');

  // 1. Configure Repository
  configureCreditsRepository({ ...credits, creditPackageAmounts: creditPackages?.amounts });

  // 2. Setup Sync Service
  const syncService = new SubscriptionSyncService(entitlementId);

  // 3. Configure Subscription Manager
  SubscriptionManager.configure({
    config: {
      apiKey: key,
      entitlementIdentifier: entitlementId,
      consumableProductIdentifiers: [creditPackages?.identifierPattern || 'credit'],
      onPurchaseCompleted: (u: string, p: string, c: any, s: any) => syncService.handlePurchase(u, p, c, s),
      onRenewalDetected: (u: string, p: string, expires: string, c: any) => syncService.handleRenewal(u, p, expires, c),
      onPremiumStatusChanged: (u: string, isP: boolean, pId: any, exp: any, willR: any, pt: any) => syncService.handlePremiumStatusChanged(u, isP, pId, exp, willR, pt),
      onCreditsUpdated,
    },
    apiKey: key,
    getAnonymousUserId,
  });

  // 4. Configure Auth aware actions
  configureAuthProvider({
    isAuthenticated: () => {
      const u = getFirebaseAuth()?.currentUser;
      return !!(u && !u.isAnonymous);
    },
    showAuthModal,
  });

  const initializeInBackground = async (userId?: string) => {
    try {
      await SubscriptionManager.initialize(userId);
      if (__DEV__) console.log('[SubscriptionInitializer] Background init complete');
    } catch (error) {
      if (__DEV__) console.log('[SubscriptionInitializer] Background init failed (non-critical):', error);
    }
  };

  // 5. Start Background Init
  const initialUserId = getCurrentUserId(getFirebaseAuth);
  initializeInBackground(initialUserId);

  // 6. Listen for Auth Changes
  setupAuthStateListener(getFirebaseAuth, (newUserId) => {
    if (__DEV__) console.log('[SubscriptionInitializer] Auth changed, re-init:', newUserId);
    initializeInBackground(newUserId);
  });
};
