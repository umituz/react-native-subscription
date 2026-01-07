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

  const loadStatus = useCallback(async (userId: string) => {
    const validationError = validateUserId(userId);
    if (validationError) {
      setError(validationError);
      return;
    }

    const serviceCheck = checkSubscriptionService();
    if (!serviceCheck.success) {
      setError(serviceCheck.error || "Service error");
      return;
    }

    await executeSubscriptionOperation(
      () => serviceCheck.service!.getSubscriptionStatus(userId),
      setLoading,
      setError,
      (result) => setStatus(result)
    );
  }, []);

  const refreshStatus = useCallback(async (userId: string) => {
    const validationError = validateUserId(userId);
    if (validationError) {
      setError(validationError);
      return;
    }

    const serviceCheck = checkSubscriptionService();
    if (!serviceCheck.success) {
      setError(serviceCheck.error || "Service error");
      return;
    }

    await executeSubscriptionOperation(
      () => serviceCheck.service!.getSubscriptionStatus(userId),
      setLoading,
      setError,
      (result) => setStatus(result)
    );
  }, []);

  const activateSubscription = useCallback(
    async (userId: string, productId: string, expiresAt: string | null) => {
      const validationError = validateUserId(userId);
      if (validationError) {
        setError(validationError);
        return;
      }

      if (!productId) {
        setError("Product ID is required");
        return;
      }

      const serviceCheck = checkSubscriptionService();
      if (!serviceCheck.success) {
        setError(serviceCheck.error || "Service error");
        return;
      }

      await executeSubscriptionOperation(
        () =>
          serviceCheck.service!.activateSubscription(userId, productId, expiresAt),
        setLoading,
        setError,
        (result) => setStatus(result)
      );
    },
    []
  );

  const deactivateSubscription = useCallback(async (userId: string) => {
    const validationError = validateUserId(userId);
    if (validationError) {
      setError(validationError);
      return;
    }

    const serviceCheck = checkSubscriptionService();
    if (!serviceCheck.success) {
      setError(serviceCheck.error || "Service error");
      return;
    }

    await executeSubscriptionOperation(
      () => serviceCheck.service!.deactivateSubscription(userId),
      setLoading,
      setError,
      (result) => setStatus(result)
    );
  }, []);

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

