/**
 * useSubscription Hook
 * React hook for subscription management
 */

import { useState, useCallback } from 'react';
import { getSubscriptionService } from '../../infrastructure/services/SubscriptionService';
import type { SubscriptionStatus } from '../../domain/entities/SubscriptionStatus';

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
    if (!userId) {
      setError('User ID is required');
      return;
    }

    const service = getSubscriptionService();
    if (!service) {
      setError('Subscription service is not initialized');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const subscriptionStatus = await service.getSubscriptionStatus(userId);
      setStatus(subscriptionStatus);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load subscription status';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshStatus = useCallback(async (userId: string) => {
    if (!userId) {
      setError('User ID is required');
      return;
    }

    const service = getSubscriptionService();
    if (!service) {
      setError('Subscription service is not initialized');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const subscriptionStatus = await service.getSubscriptionStatus(userId);
      setStatus(subscriptionStatus);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to refresh subscription status';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const activateSubscription = useCallback(
    async (userId: string, productId: string, expiresAt: string | null) => {
      if (!userId || !productId) {
        setError('User ID and Product ID are required');
        return;
      }

      const service = getSubscriptionService();
      if (!service) {
        setError('Subscription service is not initialized');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const updatedStatus = await service.activateSubscription(
          userId,
          productId,
          expiresAt,
        );
        setStatus(updatedStatus);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to activate subscription';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const deactivateSubscription = useCallback(async (userId: string) => {
    if (!userId) {
      setError('User ID is required');
      return;
    }

    const service = getSubscriptionService();
    if (!service) {
      setError('Subscription service is not initialized');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedStatus = await service.deactivateSubscription(userId);
      setStatus(updatedStatus);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to deactivate subscription';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const isPremium = status?.isPremium && (status.expiresAt === null || new Date(status.expiresAt).getTime() > Date.now()) || false;

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

