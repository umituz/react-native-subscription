import { useMemo } from 'react';
import type { PurchasesPackage } from 'react-native-purchases';
import { useSubscriptionPackages } from '../infrastructure/hooks/useSubscriptionQueries';

const EMPTY_PACKAGES: PurchasesPackage[] = [];

export interface PremiumPackages {
  packages: PurchasesPackage[];
  isLoading: boolean;
}

/**
 * Hook for fetching subscription packages.
 *
 * This hook is focused solely on package data - no premium status or mutations.
 * Use this when you only need package information for display purposes.
 */
export function usePremiumPackages(): PremiumPackages {
  const { data: packages = EMPTY_PACKAGES, isLoading } = useSubscriptionPackages();

  return useMemo(() => ({
    packages,
    isLoading,
  }), [packages, isLoading]);
}
