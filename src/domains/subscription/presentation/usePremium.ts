/**
 * usePremium Hook
 *
 * Complete subscription management.
 * Auth info automatically read from @umituz/react-native-auth.
 */

import { useCallback } from 'react';
import type { PurchasesPackage } from 'react-native-purchases';
import type { UserCredits } from '../../credits/core/Credits';
import { useCredits } from '../../credits/presentation/useCredits';
import { useSubscriptionStatus } from './useSubscriptionStatus';
import {
  useSubscriptionPackages,
  usePurchasePackage,
  useRestorePurchase,
} from '../infrastructure/hooks/useSubscriptionQueries';
import { usePaywallVisibility } from './usePaywallVisibility';

export interface UsePremiumResult {
  isPremium: boolean;
  isLoading: boolean;
  packages: PurchasesPackage[];
  credits: UserCredits | null;
  showPaywall: boolean;
  isSyncing: boolean;
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchase: () => Promise<boolean>;
  setShowPaywall: (show: boolean) => void;
  closePaywall: () => void;
  openPaywall: () => void;
}

export const usePremium = (): UsePremiumResult => {
  const { isPremium: subscriptionActive, isLoading: statusLoading } = useSubscriptionStatus();
  const { credits, isLoading: creditsLoading } = useCredits();

  const { data: packages = [], isLoading: packagesLoading } = useSubscriptionPackages();

  const purchaseMutation = usePurchasePackage();
  const restoreMutation = useRestorePurchase();

  const { showPaywall, setShowPaywall, closePaywall, openPaywall } = usePaywallVisibility();
 
  const isPremium = subscriptionActive;
  const isSyncing = subscriptionActive && credits !== null && !credits.isPremium;

  const handlePurchase = useCallback(
    async (pkg: PurchasesPackage): Promise<boolean> => {
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log("[usePremium] handlePurchase:", pkg.product.identifier);
      }
      try {
        const result = await purchaseMutation.mutateAsync(pkg);
        return result.success;
      } catch (error) {
        if (typeof __DEV__ !== "undefined" && __DEV__) {
          console.error("[usePremium] Purchase failed:", error);
        }
        return false;
      }
    },
    [purchaseMutation],
  );

  const handleRestore = useCallback(async (): Promise<boolean> => {
    try {
      const result = await restoreMutation.mutateAsync();
      return result.success;
    } catch (error) {
      if (typeof __DEV__ !== "undefined" && __DEV__) {
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
    isSyncing,
    purchasePackage: handlePurchase,
    restorePurchase: handleRestore,
    setShowPaywall,
    closePaywall,
    openPaywall,
  };
};
