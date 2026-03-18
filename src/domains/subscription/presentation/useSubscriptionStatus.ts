import { useState, useEffect, useSyncExternalStore, useCallback } from "react";
import { useAuthStore, selectUserId } from "@umituz/react-native-auth";
import { SubscriptionManager } from "../infrastructure/managers/SubscriptionManager";
import { initializationState } from "../infrastructure/state/initializationState";
import { subscriptionEventBus, SUBSCRIPTION_EVENTS } from "../../../shared/infrastructure/SubscriptionEventBus";
import type { SubscriptionStatusResult } from "./useSubscriptionStatus.types";
import type { PremiumStatus } from "../core/types/PremiumStatus";
import { isAuthenticated } from "../utils/authGuards";

export const useSubscriptionStatus = (): SubscriptionStatusResult => {
  const userId = useAuthStore(selectUserId);
  const isConfigured = SubscriptionManager.isConfigured();
  const hasUser = isAuthenticated(userId);

  const [data, setData] = useState<PremiumStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const initState = useSyncExternalStore(
    initializationState.subscribe,
    initializationState.getSnapshot,
    initializationState.getSnapshot,
  );

  const isInitialized = userId
    ? initState.initialized && initState.userId === userId
    : false;

  const fetchStatus = useCallback(async () => {
    if (!hasUser || !isConfigured || !isInitialized) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await SubscriptionManager.checkPremiumStatus();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [hasUser, isConfigured, isInitialized]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (!hasUser) return undefined;

    const unsubscribe = subscriptionEventBus.on(
      SUBSCRIPTION_EVENTS.PREMIUM_STATUS_CHANGED,
      (event: { userId: string; isPremium: boolean }) => {
        if (event.userId === userId) {
          fetchStatus();
        }
      }
    );

    return unsubscribe;
  }, [userId, hasUser, fetchStatus]);

  return {
    ...data,
    isLoading,
    error,
    refetch: fetchStatus,
  } as SubscriptionStatusResult;
};
