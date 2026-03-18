import { useMemo } from 'react';
import { usePremiumStatus } from './usePremiumStatus';
import { usePremiumPackages } from './usePremiumPackages';
import { usePremiumActions } from './usePremiumActions';
import { UsePremiumResult } from './usePremium.types';

/**
 * Facade hook that combines status, packages, and actions.
 *
 * Consider using the focused hooks for better performance:
 * - usePremiumStatus() - when you only need premium status
 * - usePremiumPackages() - when you only need package data
 * - usePremiumActions() - when you only need actions
 *
 * This facade re-renders when ANY of the sub-hooks change, whereas focused hooks
 * only re-render when their specific data changes.
 */
export const usePremium = (): UsePremiumResult => {
  const status = usePremiumStatus();
  const packages = usePremiumPackages();
  const actions = usePremiumActions();

  return useMemo(() => ({
    ...status,
    ...packages,
    ...actions,
    isLoading: status.isSyncing || packages.isLoading || actions.isLoading,
  }), [
    status,
    packages,
    actions,
  ]);
};
