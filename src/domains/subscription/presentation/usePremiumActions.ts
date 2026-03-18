import { useCallback, useMemo } from 'react';
import type { PurchasesPackage } from 'react-native-purchases';
import {
  usePurchasePackage,
  useRestorePurchase,
} from '../infrastructure/hooks/useSubscriptionQueries';
import { usePaywallVisibility } from './usePaywallVisibility';

export interface PremiumActions {
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchase: () => Promise<boolean>;
  showPaywall: boolean;
  setShowPaywall: (show: boolean) => void;
  closePaywall: () => void;
  openPaywall: () => void;
  isPurchasing: boolean;
  isRestoring: boolean;
  isLoading: boolean;
  isProductPurchasing: (productId: string) => boolean;
}

/**
 * Hook for premium actions - mutations and visibility control.
 *
 * This hook is focused on user actions: purchasing, restoring, and paywall visibility.
 * It does not include data fetching - use usePremiumStatus and usePremiumPackages for that.
 *
 * This separation allows components to only re-render when the specific state they care about changes.
 */
export function usePremiumActions(): PremiumActions {
  const purchaseMutation = usePurchasePackage();
  const restoreMutation = useRestorePurchase();
  const { showPaywall, setShowPaywall, closePaywall, openPaywall } = usePaywallVisibility();

  const purchasePackage = useCallback(
    async (pkg: PurchasesPackage): Promise<boolean> => {
      try {
        const result = await purchaseMutation.mutateAsync(pkg);
        return result.success;
      } catch (error) {
        if (__DEV__) {
          console.error('[usePremiumActions] Purchase failed:', error);
        }
        return false;
      }
    },
    [purchaseMutation],
  );

  const restorePurchase = useCallback(async (): Promise<boolean> => {
    try {
      const result = await restoreMutation.mutateAsync();
      return result.success;
    } catch (error) {
      if (__DEV__) {
        console.error('[usePremiumActions] Restore failed:', error);
      }
      return false;
    }
  }, [restoreMutation]);

  const isPurchasing = purchaseMutation.isPending;
  const isRestoring = restoreMutation.isPending;
  const isLoading = isPurchasing || isRestoring;

  const isProductPurchasing = useCallback((productId: string): boolean => {
    return purchaseMutation.variables?.product?.identifier === productId &&
           purchaseMutation.isPending;
  }, [purchaseMutation]);

  return useMemo(() => ({
    purchasePackage,
    restorePurchase,
    showPaywall,
    setShowPaywall,
    closePaywall,
    openPaywall,
    isPurchasing,
    isRestoring,
    isLoading,
    isProductPurchasing,
  }), [
    purchasePackage,
    restorePurchase,
    showPaywall,
    setShowPaywall,
    closePaywall,
    openPaywall,
    isPurchasing,
    isRestoring,
    isLoading,
    isProductPurchasing,
  ]);
}
