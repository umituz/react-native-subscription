import { useMemo } from 'react';
import { usePremiumStatus } from './usePremiumStatus';
import { usePremiumPackages } from './usePremiumPackages';
import { usePremiumActions } from './usePremiumActions';
import { UsePremiumResult } from './usePremium.types';

/**
 * Facade hook that combines status, packages, and actions.
 *
 * This provides backward compatibility with existing code while allowing
 * components to use more focused hooks (usePremiumStatus, usePremiumPackages, usePremiumActions)
 * for better performance and testability.
 *
 * For new components, consider using the focused hooks:
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
    // Merge loading states for backward compatibility
    isLoading: status.isSyncing || packages.isLoading || actions.isLoading,
  }), [
    status,
    packages,
    actions,
  ]);
};
