import { useState, useEffect, useSyncExternalStore, useRef, useCallback } from "react";
import {
  useAuthStore,
  selectUserId,
} from "@umituz/react-native-auth";
import { SubscriptionManager } from '../../infrastructure/managers/SubscriptionManager';
import { initializationState } from "../../infrastructure/state/initializationState";

export const useSubscriptionPackages = () => {
  const userId = useAuthStore(selectUserId);
  const isConfigured = SubscriptionManager.isConfigured();
  const prevUserIdRef = useRef(userId);

  const [packages, setPackages] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const initState = useSyncExternalStore(
    initializationState.subscribe,
    initializationState.getSnapshot,
    initializationState.getSnapshot,
  );

  const isInitialized = initState.initialized || SubscriptionManager.isInitialized();

  const fetchPackages = useCallback(async () => {
    if (!isConfigured || !isInitialized) {
      setPackages(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await SubscriptionManager.getPackages();
      setPackages(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [isConfigured, isInitialized]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  useEffect(() => {
    const prevUserId = prevUserIdRef.current;
    prevUserIdRef.current = userId;

    if (prevUserId !== userId) {
      fetchPackages();
    }
  }, [userId, fetchPackages]);

  const refetch = useCallback(() => {
    fetchPackages();
  }, [fetchPackages]);

  return {
    data: packages,
    isLoading,
    error,
    refetch,
  };
};
