/**
 * useSubscription Hook
 * React hook for subscription management
 */

import { useState, useCallback } from 'react';
import type { SubscriptionStatus } from '../../domain/entities/SubscriptionStatus';
import { isSubscriptionValid } from '../../domain/entities/SubscriptionStatus';
import {
  checkSubscriptionService,
  validateUserId,
  executeSubscriptionOperation,
} from './useSubscription.utils';

export interface UseSubscriptionResult {
  /** Current subscription status */
  status: SubscriptionStatus | null;
  /** Whether subscription is loading */
  loading: boolean;
  /** Error if any */
  error: string | null;
  /** Whether user has active subscription */
  isPremium: boolean;
  /** Load subscription status */
  loadStatus: (userId: string) => Promise<void>;
  /** Refresh subscription status */
  refreshStatus: (userId: string) => Promise<void>;
  /** Activate subscription */
  activateSubscription: (
    userId: string,
    productId: string,
    expiresAt: string | null,
  ) => Promise<void>;
  /** Deactivate subscription */
  deactivateSubscription: (userId: string) => Promise<void>;
}

/**
 * Hook for subscription operations
 *
 * @example
 * ```typescript
 * const { status, isPremium, loadStatus } = useSubscription();
 * ```
 */
export function useSubscription(): UseSubscriptionResult {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performOperation = useCallback(async (
    userId: string,
    operation: () => Promise<SubscriptionStatus | null | void>
  ) => {
    const errorMsg = validateUserId(userId);
    if (errorMsg) {
      setError(errorMsg);
      return;
    }

    const check = checkSubscriptionService();
    if (!check.success) {
      setError(check.error || "Service error");
      return;
    }

    await executeSubscriptionOperation(
      operation,
      setLoading,
      setError,
      (result) => { if (result) setStatus(result as SubscriptionStatus); }
    );
  }, []);

  const loadStatus = useCallback((userId: string) => 
    performOperation(userId, () => {
      const { service } = checkSubscriptionService();
       
      return service!.getSubscriptionStatus(userId);
    }), [performOperation]);

  const refreshStatus = loadStatus;

  const activateSubscription = useCallback(
    (userId: string, productId: string, expiresAt: string | null) => {
      if (!productId) {
        setError("Product ID is required");
        return Promise.resolve();
      }
      return performOperation(userId, () => {
        const { service } = checkSubscriptionService();
         
        return service!.activateSubscription(userId, productId, expiresAt).then(res => res ?? undefined);
      });
    },
    [performOperation]
  );

  const deactivateSubscription = useCallback((userId: string) => 
    performOperation(userId, () => {
        const { service } = checkSubscriptionService();
         
        return service!.deactivateSubscription(userId).then(res => res ?? undefined);
    }), [performOperation]);

  const isPremium = isSubscriptionValid(status);

  return {
    status,
    loading,
    error,
    isPremium,
    loadStatus,
    refreshStatus,
    activateSubscription,
    deactivateSubscription,
  };
}

