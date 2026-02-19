/**
 * Subscription Packages Hook
 * TanStack query for fetching available packages (offerings)
 * Auth info automatically read from @umituz/react-native-auth
 *
 * IMPORTANT: Packages (offerings) are NOT user-specific - they're the same
 * for all users. We only need RevenueCat to be initialized, not necessarily
 * for a specific user. User-specific checks belong in useSubscriptionStatus.
 */

import { useQuery, useQueryClient } from "@umituz/react-native-design-system";
import { useEffect, useRef, useSyncExternalStore } from "react";
import {
  useAuthStore,
  selectUserId,
} from "@umituz/react-native-auth";
import { SubscriptionManager } from '../../infrastructure/managers/SubscriptionManager';
import { initializationState } from "../../infrastructure/state/initializationState";
import {
  SUBSCRIPTION_QUERY_KEYS,
} from "./subscriptionQueryKeys";

/**
 * Fetch available subscription packages
 * Works for both authenticated and anonymous users
 * Auth info automatically read from auth store
 */
export const useSubscriptionPackages = () => {
  const userId = useAuthStore(selectUserId);
  const isConfigured = SubscriptionManager.isConfigured();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef(userId);

  // Reactive initialization state - triggers re-render when BackgroundInitializer completes
  const initState = useSyncExternalStore(
    initializationState.subscribe,
    initializationState.getSnapshot,
    initializationState.getSnapshot,
  );

  // Packages (offerings) are NOT user-specific - same for all users.
  // We only need RevenueCat to be initialized at all.
  // Use reactive state OR direct manager check for backwards compatibility.
  const isInitialized = initState.initialized || SubscriptionManager.isInitialized();

  const query = useQuery({
    queryKey: [...SUBSCRIPTION_QUERY_KEYS.packages, userId ?? "anonymous"] as const,
    queryFn: async () => {
      return SubscriptionManager.getPackages();
    },
    enabled: isConfigured && isInitialized,
    gcTime: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  useEffect(() => {
    const prevUserId = prevUserIdRef.current;
    prevUserIdRef.current = userId;

    if (prevUserId !== userId) {
      if (prevUserId) {
        queryClient.cancelQueries({
          queryKey: [...SUBSCRIPTION_QUERY_KEYS.packages, prevUserId],
        });
        queryClient.removeQueries({
          queryKey: [...SUBSCRIPTION_QUERY_KEYS.packages, prevUserId],
        });
      } else {
        queryClient.cancelQueries({
          queryKey: [...SUBSCRIPTION_QUERY_KEYS.packages, "anonymous"],
        });
        queryClient.removeQueries({
          queryKey: [...SUBSCRIPTION_QUERY_KEYS.packages, "anonymous"],
        });
      }

      queryClient.invalidateQueries({
        queryKey: [...SUBSCRIPTION_QUERY_KEYS.packages, userId ?? "anonymous"],
      });
    }
  }, [userId, queryClient]);

  return query;
};
