import { useCallback, useMemo } from 'react';
import type { PurchasesPackage } from 'react-native-purchases';
import { useCredits } from '../../credits/presentation/useCredits';
import { useSubscriptionStatus } from './useSubscriptionStatus';
import {
  useSubscriptionPackages,
  usePurchasePackage,
  useRestorePurchase,
} from '../infrastructure/hooks/useSubscriptionQueries';
import { usePaywallVisibility } from './usePaywallVisibility';
import { isPremiumSyncPending } from '../utils/syncStatus';
import { UsePremiumResult } from './usePremium.types';

const EMPTY_PACKAGES: PurchasesPackage[] = [];

export const usePremium = (): UsePremiumResult => {

  const { isPremium: subscriptionActive, isLoading: statusLoading } = useSubscriptionStatus();
  const { credits, isLoading: creditsLoading } = useCredits();

  const { data: packages = EMPTY_PACKAGES, isLoading: packagesLoading } = useSubscriptionPackages();

  const purchaseMutation = usePurchasePackage();
  const restoreMutation = useRestorePurchase();

  const { showPaywall, setShowPaywall, closePaywall, openPaywall } = usePaywallVisibility();

  const isPremium = subscriptionActive || (credits?.isPremium ?? false);
  const isSyncing = isPremiumSyncPending({
    statusLoading,
    creditsLoading,
    subscriptionActive,
    credits,
  });

  const handlePurchase = useCallback(
    async (pkg: PurchasesPackage): Promise<boolean> => {
      try {
        const result = await purchaseMutation.mutateAsync(pkg);
        return result.success;
      } catch {
        return false;
      }
    },
    [purchaseMutation],
  );

  const handleRestore = useCallback(async (): Promise<boolean> => {
    try {
      const result = await restoreMutation.mutateAsync();
      return result.success;
    } catch {
      return false;
    }
  }, [restoreMutation]);

  return useMemo(() => ({
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
  }), [
    isPremium,
    statusLoading,
    creditsLoading,
    packagesLoading,
    purchaseMutation.isPending,
    restoreMutation.isPending,
    packages,
    credits,
    showPaywall,
    isSyncing,
    handlePurchase,
    handleRestore,
    setShowPaywall,
    closePaywall,
    openPaywall,
  ]);
};
