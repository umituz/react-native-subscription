/**
 * useAuthSubscriptionSync Hook
 * Single source of truth for RevenueCat initialization
 * Handles initial setup and auth state transitions
 * Generic implementation for 100+ apps with auth provider abstraction
 */

import { useEffect, useRef, useCallback } from "react";

export interface AuthSubscriptionSyncConfig {
  /** Function to subscribe to auth state changes - returns unsubscribe function */
  onAuthStateChanged: (callback: (userId: string | null) => void) => () => void;
  /** Function to initialize subscription for a user */
  initializeSubscription: (userId: string) => Promise<void>;
}

export function useAuthSubscriptionSync(
  config: AuthSubscriptionSyncConfig,
): void {
  const { onAuthStateChanged, initializeSubscription } = config;
  const previousUserIdRef = useRef<string | null>(null);
  const isInitializedRef = useRef(false);

  const initialize = useCallback(
    async (userId: string) => {
      await initializeSubscription(userId);
    },
    [initializeSubscription],
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (userId: string | null) => {
      if (!userId) {
        previousUserIdRef.current = null;
        return;
      }

      const previousUserId = previousUserIdRef.current;

      if (userId === previousUserId) {
        return;
      }

      if (previousUserId && previousUserId !== userId) {
        await initialize(userId);
      } else if (!isInitializedRef.current) {
        await initialize(userId);
        isInitializedRef.current = true;
      }

      previousUserIdRef.current = userId;
    });

    return () => unsubscribe();
  }, [onAuthStateChanged, initialize]);
}
