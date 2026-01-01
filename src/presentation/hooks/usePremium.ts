/**
 * usePremium Hook
 * Complete subscription management for 100+ apps
 * Works for both authenticated and anonymous users
 *
 * IMPORTANT: isPremium is based on actual RevenueCat subscription status,
 * NOT on whether credits document exists.
 */

import { useCallback } from 'react';
import type { PurchasesPackage } from 'react-native-purchases';
import type { UserCredits } from '../../domain/entities/Credits';
import { useCredits } from './useCredits';
import { useSubscriptionStatus } from './useSubscriptionStatus';
import {
    useSubscriptionPackages,
    usePurchasePackage,
    useRestorePurchase,
} from '../../revenuecat/presentation/hooks/useSubscriptionQueries';
import { usePaywallVisibility } from './usePaywallVisibility';

export interface UsePremiumResult {
  /** User has active premium subscription */
  isPremium: boolean;
  /** Loading credits or packages */
  isLoading: boolean;
  /** Available subscription packages */
  packages: PurchasesPackage[];
  /** User's credits (null if not premium) */
  credits: UserCredits | null;
  /** Paywall visibility state */
  showPaywall: boolean;
  /** Purchase a subscription package */
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  /** Restore previous purchases */
  restorePurchase: () => Promise<boolean>;
  /** Set paywall visibility */
  setShowPaywall: (show: boolean) => void;
  /** Close paywall */
  closePaywall: () => void;
  /** Open paywall */
  openPaywall: () => void;
}

/**
 * Complete premium subscription management
 *
 * @param userId - User ID (undefined for anonymous users)
 * @returns Premium status, packages, and subscription actions
 *
 * @example
 * ```typescript
 * const { isPremium, packages, purchasePackage } = usePremium(userId);
 * ```
 */
export const usePremium = (userId?: string): UsePremiumResult => {
  if (__DEV__) {
    console.log('[DEBUG usePremium] Hook called', { userId: userId || 'ANONYMOUS' });
  }

  // Fetch real subscription status from RevenueCat
  const { isPremium: subscriptionActive, isLoading: statusLoading } =
    useSubscriptionStatus({
      userId,
      enabled: !!userId,
    });

  // Fetch user credits (server state)
  const { credits, isLoading: creditsLoading } = useCredits({
    userId,
    enabled: !!userId,
  });

  // Fetch subscription packages (works for anonymous too)
  const { data: packages = [], isLoading: packagesLoading } =
    useSubscriptionPackages(userId);

  if (__DEV__) {
    console.log('[DEBUG usePremium] State', {
      userId: userId || 'ANONYMOUS',
      packagesCount: packages?.length || 0,
      packagesLoading,
      creditsLoading,
      statusLoading,
      isPremium: subscriptionActive,
    });
  }

  // Purchase and restore mutations
  const purchaseMutation = usePurchasePackage(userId);
  const restoreMutation = useRestorePurchase(userId);

  // Paywall visibility state
  const { showPaywall, setShowPaywall, closePaywall, openPaywall } =
    usePaywallVisibility();

  // Premium status = actual subscription status from RevenueCat
  const isPremium = subscriptionActive;

  // Purchase handler with proper error handling
  const handlePurchase = useCallback(
    async (pkg: PurchasesPackage): Promise<boolean> => {
      try {
        const result = await purchaseMutation.mutateAsync(pkg);
        return result.success;
      } catch (error) {
        if (__DEV__) {
          console.error("[usePremium] Purchase failed:", error);
        }
        return false;
      }
    },
    [purchaseMutation],
  );

  // Restore handler with proper error handling
  const handleRestore = useCallback(async (): Promise<boolean> => {
    try {
      const result = await restoreMutation.mutateAsync();
      return result.success;
    } catch (error) {
      if (__DEV__) {
        console.error("[usePremium] Restore failed:", error);
      }
      return false;
    }
  }, [restoreMutation]);

  return {
    isPremium,
    isLoading:
      statusLoading ||
      creditsLoading ||
      packagesLoading ||
      purchaseMutation.isPending ||
      restoreMutation.isPending,
    packages,
    credits,
    showPaywall,
    purchasePackage: handlePurchase,
    restorePurchase: handleRestore,
    setShowPaywall,
    closePaywall,
    openPaywall,
  };
};
