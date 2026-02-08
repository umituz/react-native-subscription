/**
 * Subscription Initializer
 *
 * Uses RevenueCat best practices:
 * - Non-blocking initialization (fire and forget)
 * - Relies on CustomerInfoUpdateListener for state updates
 * - No manual timeouts - uses auth state listener with cleanup
 */

import { Platform } from "react-native";
import type { CustomerInfo } from "react-native-purchases";
import { configureCreditsRepository, getCreditsRepository } from "../repositories/CreditsRepositoryProvider";
import { SubscriptionManager } from "../../revenuecat/infrastructure/managers/SubscriptionManager";
import { configureAuthProvider } from "../../presentation/hooks/useAuthAwarePurchase";
import type { RevenueCatData } from "../../domain/types/RevenueCatData";
import type { SubscriptionInitConfig, FirebaseAuthLike } from "./SubscriptionInitializerTypes";
import type { PurchaseSource } from "../../domain/entities/Credits";

export type { FirebaseAuthLike, CreditPackageConfig, SubscriptionInitConfig } from "./SubscriptionInitializerTypes";

/**
 * Gets the current user ID from Firebase auth.
 * Uses listener pattern for reliability instead of timeout.
 * Falls back immediately if no auth is available.
 */
const getCurrentUserId = (getAuth: () => FirebaseAuthLike | null): string | undefined => {
  const auth = getAuth();
  if (!auth) return undefined;
  return auth.currentUser?.uid;
};

/**
 * Sets up auth state listener that will re-initialize subscription
 * when user auth state changes (login/logout).
 */
const setupAuthStateListener = (
  getAuth: () => FirebaseAuthLike | null,
  onUserChange: (userId: string | undefined) => void
): (() => void) | null => {
  const auth = getAuth();
  if (!auth) return null;

  return auth.onAuthStateChanged((user) => {
    onUserChange(user?.uid);
  });
};

/** Extract RevenueCat data from CustomerInfo (Single Source of Truth) */
const extractRevenueCatData = (customerInfo: CustomerInfo, entitlementId: string): RevenueCatData => {
  const entitlement = customerInfo.entitlements.active[entitlementId]
    ?? customerInfo.entitlements.all[entitlementId];
  return {
    expirationDate: entitlement?.expirationDate ?? customerInfo.latestExpirationDate ?? null,
    willRenew: entitlement?.willRenew ?? false,
    originalTransactionId: entitlement?.originalPurchaseDate ?? undefined,
    isPremium: Object.keys(customerInfo.entitlements.active).length > 0,
    periodType: entitlement?.periodType as "NORMAL" | "INTRO" | "TRIAL" | undefined,
  };
};

export const initializeSubscription = async (config: SubscriptionInitConfig): Promise<void> => {
  const {
    apiKey, apiKeyIos, apiKeyAndroid, entitlementId, credits,
    getAnonymousUserId, getFirebaseAuth, showAuthModal,
    onCreditsUpdated, creditPackages,
  } = config;

  const key = Platform.OS === 'ios' ? (apiKeyIos || apiKey || '') : (apiKeyAndroid || apiKey || '');
  if (!key) throw new Error('API key required');

  configureCreditsRepository({ ...credits, creditPackageAmounts: creditPackages?.amounts });

  const onPurchase = async (userId: string, productId: string, customerInfo: CustomerInfo, source?: PurchaseSource) => {
    if (__DEV__) console.log('[SubscriptionInitializer] onPurchase:', { userId, productId, source });
    try {
      const revenueCatData = extractRevenueCatData(customerInfo, entitlementId);
      await getCreditsRepository().initializeCredits(userId, `purchase_${productId}_${Date.now()}`, productId, source, revenueCatData);
      onCreditsUpdated?.(userId);
    } catch (error) {
      if (__DEV__) console.error('[SubscriptionInitializer] Credits init failed:', error);
    }
  };

  const onRenewal = async (userId: string, productId: string, newExpirationDate: string, customerInfo: CustomerInfo) => {
    if (__DEV__) console.log('[SubscriptionInitializer] onRenewal:', { userId, productId });
    try {
      const revenueCatData = extractRevenueCatData(customerInfo, entitlementId);
      revenueCatData.expirationDate = newExpirationDate || revenueCatData.expirationDate;
      await getCreditsRepository().initializeCredits(userId, `renewal_${productId}_${Date.now()}`, productId, "renewal", revenueCatData);
      onCreditsUpdated?.(userId);
    } catch (error) {
      if (__DEV__) console.error('[SubscriptionInitializer] Renewal credits init failed:', error);
    }
  };

  const onPremiumStatusChanged = async (
    userId: string, isPremium: boolean, productId?: string,
    expiresAt?: string, willRenew?: boolean, periodType?: "NORMAL" | "INTRO" | "TRIAL"
  ) => {
    if (__DEV__) console.log('[SubscriptionInitializer] onPremiumStatusChanged:', { userId, isPremium, productId, willRenew, periodType });
    try {
      // If premium became false, check if actually expired or just canceled
      if (!isPremium && productId) {
        const isActuallyExpired = !expiresAt || new Date(expiresAt) < new Date();
        if (isActuallyExpired) {
          await getCreditsRepository().syncExpiredStatus(userId);
          if (__DEV__) console.log('[SubscriptionInitializer] Subscription expired, synced status');
        } else {
          if (__DEV__) console.log('[SubscriptionInitializer] Canceled but not expired, preserving until:', expiresAt);
          const revenueCatData: RevenueCatData = { expirationDate: expiresAt, willRenew: false, isPremium: true, periodType };
          await getCreditsRepository().initializeCredits(userId, `status_sync_canceled_${Date.now()}`, productId, "settings", revenueCatData);
        }
        onCreditsUpdated?.(userId);
        return;
      }

      // Premium user - initialize credits with subscription data
      const revenueCatData: RevenueCatData = { expirationDate: expiresAt ?? null, willRenew: willRenew ?? false, isPremium, periodType };
      await getCreditsRepository().initializeCredits(userId, `status_sync_${Date.now()}`, productId, "settings", revenueCatData);
      if (__DEV__) console.log('[SubscriptionInitializer] Premium status synced to Firestore');
      onCreditsUpdated?.(userId);
    } catch (error) {
      if (__DEV__) console.error('[SubscriptionInitializer] Premium status sync failed:', error);
    }
  };

  SubscriptionManager.configure({
    config: {
      apiKey: key,
      entitlementIdentifier: entitlementId,
      consumableProductIdentifiers: [creditPackages?.identifierPattern || 'credit'],
      onPurchaseCompleted: onPurchase,
      onRenewalDetected: onRenewal,
      onPremiumStatusChanged,
      onCreditsUpdated,
    },
    apiKey: key,
    getAnonymousUserId,
  });

  // Configure auth provider immediately (sync)
  configureAuthProvider({
    isAuthenticated: () => {
      const u = getFirebaseAuth()?.currentUser;
      return !!(u && !u.isAnonymous);
    },
    showAuthModal,
  });

  // Get initial user ID (sync - no waiting)
  const initialUserId = getCurrentUserId(getFirebaseAuth);

  /**
   * Non-blocking initialization (fire and forget)
   * RevenueCat best practice: Don't block on initialization.
   * The CustomerInfoUpdateListener will handle state updates reactively.
   */
  const initializeInBackground = async (userId?: string) => {
    try {
      await SubscriptionManager.initialize(userId);
      if (__DEV__) console.log('[SubscriptionInitializer] Background init complete');
    } catch (error) {
      // Non-critical - listener will handle updates
      if (__DEV__) console.log('[SubscriptionInitializer] Background init error (non-critical):', error);
    }
  };

  // Start initialization in background (non-blocking)
  initializeInBackground(initialUserId);

  // Set up auth state listener for reactive updates
  // When user logs in/out, re-initialize with new user ID
  setupAuthStateListener(getFirebaseAuth, (newUserId) => {
    if (__DEV__) console.log('[SubscriptionInitializer] Auth state changed:', newUserId ? 'logged in' : 'logged out');
    initializeInBackground(newUserId);
  });
};
