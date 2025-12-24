/**
 * usePremium Hook
 * Complete subscription management for 100+ apps
 * Works for both authenticated and anonymous users
 */

import { useCallback } from 'react';
import type { PurchasesPackage } from 'react-native-purchases';
import type { UserCredits } from '../../domain/entities/Credits';
import { useCredits } from './useCredits';
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
  // Fetch user credits (server state)
  const { credits, isLoading: creditsLoading } = useCredits({
    userId,
    enabled: !!userId,
  });

  // Fetch subscription packages (works for anonymous too)
  const { data: packages = [], isLoading: packagesLoading } =
    useSubscriptionPackages(userId);

  // Purchase and restore mutations
  const purchaseMutation = usePurchasePackage(userId);
  const restoreMutation = useRestorePurchase(userId);

  // Paywall visibility state
  const { showPaywall, setShowPaywall, closePaywall, openPaywall } =
    usePaywallVisibility();

  // Premium status = has credits
  const isPremium = credits !== null;

  // Purchase handler
  const handlePurchase = useCallback(
    async (pkg: PurchasesPackage): Promise<boolean> => {
      const success = await purchaseMutation.mutateAsync(pkg);
      return success;
    },
    [purchaseMutation],
  );

  // Restore handler
  const handleRestore = useCallback(async (): Promise<boolean> => {
    const success = await restoreMutation.mutateAsync();
    return success;
  }, [restoreMutation]);

  return {
    isPremium,
    isLoading:
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
