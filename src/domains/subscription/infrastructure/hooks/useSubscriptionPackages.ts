/**
 * Subscription Packages Hook
 * TanStack query for fetching available packages
 * Auth info automatically read from @umituz/react-native-auth
 */

import { useQuery, useQueryClient } from "@umituz/react-native-design-system";
import { useEffect, useRef } from "react";
import {
  useAuthStore,
  selectUserId,
} from "@umituz/react-native-auth";
import { SubscriptionManager } from '../../infrastructure/managers/SubscriptionManager';
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

  // Check if initialized (BackgroundInitializer handles initialization)
  const isInitialized = userId
    ? SubscriptionManager.isInitializedForUser(userId)
    : SubscriptionManager.isInitialized();

  const query = useQuery({
    queryKey: [...SUBSCRIPTION_QUERY_KEYS.packages, userId ?? "anonymous"] as const,
    queryFn: async () => {
      // No side effects - just fetch packages
      // Initialization is handled by BackgroundInitializer
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
