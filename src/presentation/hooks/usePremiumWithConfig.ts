/**
 * usePremiumWithConfig Hook
 * Premium status from TanStack Query (credits)
 * Subscription state from TanStack Query
 * Generic implementation for 100+ apps with auth provider abstraction
 *
 * Note: Credit allocation is handled by CustomerInfo Listener (onCreditRenewal)
 * configured in SubscriptionManager. Manual credit initialization removed to
 * prevent duplicate allocation.
 */

import { useCallback } from "react";
import type { PurchasesPackage } from "react-native-purchases";
import type { UserCredits } from "../../domain/entities/Credits";
import { useCredits } from "./useCredits";
import {
  useSubscriptionPackages,
  usePurchasePackage,
  useRestorePurchase,
} from "../../revenuecat/presentation/hooks/useSubscriptionQueries";
import { usePaywallVisibility } from "./usePaywallVisibility";

export interface UsePremiumWithConfigParams {
  /** Function to get current user ID (can be from Firebase, Supabase, etc.) */
  getUserId: () => string | null | undefined;
  /** Enable/disable credits query */
  enabled?: boolean;
}

export interface UsePremiumWithConfigResult {
  isPremium: boolean;
  isLoading: boolean;
  packages: PurchasesPackage[];
  credits: UserCredits | null;
  showPaywall: boolean;
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchase: () => Promise<boolean>;
  setShowPaywall: (show: boolean) => void;
  closePaywall: () => void;
  openPaywall: () => void;
}

export const usePremiumWithConfig = (
  params: UsePremiumWithConfigParams,
): UsePremiumWithConfigResult => {
  const { getUserId, enabled = true } = params;
  const userId = getUserId() ?? undefined;

  const { credits, isLoading: creditsLoading } = useCredits({
    userId,
    enabled: enabled && !!userId,
  });

  const { data: packages = [], isLoading: packagesLoading } =
    useSubscriptionPackages(userId);
  const purchaseMutation = usePurchasePackage(userId);
  const restoreMutation = useRestorePurchase(userId);

  const { showPaywall, setShowPaywall, closePaywall, openPaywall } =
    usePaywallVisibility();

  // User is premium if they have credits
  // NOTE: This assumes credits system = premium subscription
  // If your app uses CustomerInfo for premium status, use useCustomerInfo() instead
  const isPremium = credits !== null;

  const handlePurchase = useCallback(
    async (pkg: PurchasesPackage): Promise<boolean> => {
      const success = await purchaseMutation.mutateAsync(pkg);
      // Credit allocation handled by CustomerInfo Listener (onCreditRenewal)
      return success;
    },
    [purchaseMutation],
  );

  const handleRestore = useCallback(async (): Promise<boolean> => {
    const success = await restoreMutation.mutateAsync();
    // Credit allocation handled by CustomerInfo Listener (onCreditRenewal)
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
