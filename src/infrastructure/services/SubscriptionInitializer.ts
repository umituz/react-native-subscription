/**
 * Subscription Initializer
 */

declare const __DEV__: boolean;

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
  const {
    apiKey, apiKeyIos, apiKeyAndroid, entitlementId, credits,
    getAnonymousUserId, getFirebaseAuth, showAuthModal,
    onCreditsUpdated, creditPackages, timeoutMs = 10000, authStateTimeoutMs = 2000,
  } = config;

  const key = Platform.OS === 'ios' ? (apiKeyIos || apiKey || '') : (apiKeyAndroid || apiKey || '');
  if (!key) throw new Error('API key required');

  configureCreditsRepository({ ...credits, creditPackageAmounts: creditPackages?.amounts });

  /** Extract RevenueCat data from CustomerInfo (Single Source of Truth) */
  const extractRevenueCatData = (customerInfo: CustomerInfo, _productId: string): RevenueCatData => {
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

  const onPurchase = async (userId: string, productId: string, customerInfo: CustomerInfo, source?: string) => {
    if (__DEV__) {
      console.log('[SubscriptionInitializer] onPurchase called:', { userId, productId, source });
    }
    try {
      const revenueCatData = extractRevenueCatData(customerInfo, productId);
      const result = await getCreditsRepository().initializeCredits(
        userId,
        `purchase_${productId}_${Date.now()}`,
        productId,
        source as any,
        revenueCatData
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

  const onRenewal = async (userId: string, productId: string, newExpirationDate: string, customerInfo: CustomerInfo) => {
    if (__DEV__) {
      console.log('[SubscriptionInitializer] onRenewal called:', { userId, productId });
    }
    try {
      const revenueCatData = extractRevenueCatData(customerInfo, productId);
      // Update expiration date from renewal
      revenueCatData.expirationDate = newExpirationDate || revenueCatData.expirationDate;
      const result = await getCreditsRepository().initializeCredits(
        userId,
        `renewal_${productId}_${Date.now()}`,
        productId,
        "renewal" as any,
        revenueCatData
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

  /** Sync premium status changes (including cancellation) to Firestore */
  const onPremiumStatusChanged = async (
    userId: string,
    isPremium: boolean,
    productId?: string,
    expiresAt?: string,
    willRenew?: boolean,
    periodType?: "NORMAL" | "INTRO" | "TRIAL"
  ) => {
    if (__DEV__) {
      console.log('[SubscriptionInitializer] onPremiumStatusChanged:', { userId, isPremium, productId, willRenew, periodType });
    }
    try {
      // If not premium and no productId, this is a free user - don't overwrite free credits
      if (!isPremium && !productId) {
        if (__DEV__) {
          console.log('[SubscriptionInitializer] Free user detected, preserving free credits');
        }
        return;
      }

      // If premium became false, check if actually expired or just canceled
      if (!isPremium && productId) {
        // Check if subscription is truly expired (expiration date in the past)
        const isActuallyExpired = !expiresAt || new Date(expiresAt) < new Date();

        if (isActuallyExpired) {
          // Subscription truly expired - zero out credits
          await getCreditsRepository().syncExpiredStatus(userId);
          if (__DEV__) {
            console.log('[SubscriptionInitializer] Subscription expired, synced status');
          }
        } else {
          // Subscription canceled but not expired - preserve credits until expiration
          if (__DEV__) {
            console.log('[SubscriptionInitializer] Subscription canceled but not expired, preserving credits until:', expiresAt);
          }
          // Update willRenew to false but keep credits
          const revenueCatData: RevenueCatData = {
            expirationDate: expiresAt,
            willRenew: false, // Canceled
            isPremium: true, // Still has access until expiration
            periodType,
          };
          await getCreditsRepository().initializeCredits(
            userId,
            `status_sync_canceled_${Date.now()}`,
            productId,
            "settings" as any,
            revenueCatData
          );
        }
        onCreditsUpdated?.(userId);
        return;
      }

      // Premium user - initialize credits with subscription data
      const revenueCatData: RevenueCatData = {
        expirationDate: expiresAt ?? null,
        willRenew: willRenew ?? false,
        isPremium,
        periodType,
      };
      await getCreditsRepository().initializeCredits(
        userId,
        `status_sync_${Date.now()}`,
        productId,
        "settings" as any,
        revenueCatData
      );
      if (__DEV__) {
        console.log('[SubscriptionInitializer] Premium status synced to Firestore');
      }
      onCreditsUpdated?.(userId);
    } catch (error) {
      if (__DEV__) {
        console.error('[SubscriptionInitializer] Premium status sync failed:', error);
      }
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
  
  // Initialize subscription without blocking - let it complete in background
  try {
    if (timeoutMs > 0) {
      const timeout = new Promise<boolean>((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), timeoutMs)
      );
      await Promise.race([SubscriptionManager.initialize(userId), timeout]);
    } else {
      await SubscriptionManager.initialize(userId);
    }
  } catch (error) {
    // Log error but don't throw - subscription will continue in background
    if (__DEV__) {
      console.warn('[SubscriptionInitializer] Initialize timeout/error (non-critical):', error);
    }
  }

  configureAuthProvider({
    isAuthenticated: () => {
      const u = getFirebaseAuth()?.currentUser;
      return !!(u && !u.isAnonymous);
    },
    showAuthModal,
  });
};
