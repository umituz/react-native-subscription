/**
 * Subscription Initializer
 */
declare const __DEV__: boolean;

import { Platform } from "react-native";
import type { CustomerInfo } from "react-native-purchases";
import { configureCreditsRepository, getCreditsRepository } from "../repositories/CreditsRepositoryProvider";
import { SubscriptionManager } from "../../revenuecat/infrastructure/managers/SubscriptionManager";
import { configureAuthProvider } from "../../presentation/hooks/useAuthAwarePurchase";
import type { RevenueCatData } from "../../domain/types/RevenueCatData";
import type { SubscriptionInitConfig, FirebaseAuthLike } from "./SubscriptionInitializerTypes";

export type { FirebaseAuthLike, CreditPackageConfig, SubscriptionInitConfig } from "./SubscriptionInitializerTypes";

const waitForAuthState = async (getAuth: () => FirebaseAuthLike | null, timeoutMs: number): Promise<string | undefined> => {
  const auth = getAuth();
  if (!auth) return undefined;
  if (auth.currentUser) return auth.currentUser.uid;
  return new Promise((resolve) => {
    const unsub = auth.onAuthStateChanged((u) => { unsub(); resolve(u?.uid); });
    setTimeout(() => { unsub(); resolve(undefined); }, timeoutMs);
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
    onCreditsUpdated, creditPackages, timeoutMs = 10000, authStateTimeoutMs = 2000,
  } = config;

  const key = Platform.OS === 'ios' ? (apiKeyIos || apiKey || '') : (apiKeyAndroid || apiKey || '');
  if (!key) throw new Error('API key required');

  configureCreditsRepository({ ...credits, creditPackageAmounts: creditPackages?.amounts });

  const onPurchase = async (userId: string, productId: string, customerInfo: CustomerInfo, source?: string) => {
    if (__DEV__) console.log('[SubscriptionInitializer] onPurchase:', { userId, productId, source });
    try {
      const revenueCatData = extractRevenueCatData(customerInfo, entitlementId);
      await getCreditsRepository().initializeCredits(userId, `purchase_${productId}_${Date.now()}`, productId, source as any, revenueCatData);
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
      await getCreditsRepository().initializeCredits(userId, `renewal_${productId}_${Date.now()}`, productId, "renewal" as any, revenueCatData);
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
      // If not premium and no productId, this is a free user - don't overwrite free credits
      if (!isPremium && !productId) {
        if (__DEV__) console.log('[SubscriptionInitializer] Free user detected, preserving free credits');
        return;
      }

      // If premium became false, check if actually expired or just canceled
      if (!isPremium && productId) {
        const isActuallyExpired = !expiresAt || new Date(expiresAt) < new Date();
        if (isActuallyExpired) {
          await getCreditsRepository().syncExpiredStatus(userId);
          if (__DEV__) console.log('[SubscriptionInitializer] Subscription expired, synced status');
        } else {
          if (__DEV__) console.log('[SubscriptionInitializer] Canceled but not expired, preserving until:', expiresAt);
          const revenueCatData: RevenueCatData = { expirationDate: expiresAt, willRenew: false, isPremium: true, periodType };
          await getCreditsRepository().initializeCredits(userId, `status_sync_canceled_${Date.now()}`, productId, "settings" as any, revenueCatData);
        }
        onCreditsUpdated?.(userId);
        return;
      }

      // Premium user - initialize credits with subscription data
      const revenueCatData: RevenueCatData = { expirationDate: expiresAt ?? null, willRenew: willRenew ?? false, isPremium, periodType };
      await getCreditsRepository().initializeCredits(userId, `status_sync_${Date.now()}`, productId, "settings" as any, revenueCatData);
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

  const userId = await waitForAuthState(getFirebaseAuth, authStateTimeoutMs);

  try {
    if (timeoutMs > 0) {
      const timeout = new Promise<boolean>((_, reject) => setTimeout(() => reject(new Error("Timeout")), timeoutMs));
      await Promise.race([SubscriptionManager.initialize(userId), timeout]);
    } else {
      await SubscriptionManager.initialize(userId);
    }
  } catch (error) {
    if (__DEV__) console.warn('[SubscriptionInitializer] Initialize timeout/error (non-critical):', error);
  }

  configureAuthProvider({
    isAuthenticated: () => {
      const u = getFirebaseAuth()?.currentUser;
      return !!(u && !u.isAnonymous);
    },
    showAuthModal,
  });
};
