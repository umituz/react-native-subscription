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

export const useSubscriptionPackages = () => {
  const userId = useAuthStore(selectUserId);
  const isConfigured = SubscriptionManager.isConfigured();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef(userId);

  const initState = useSyncExternalStore(
    initializationState.subscribe,
    initializationState.getSnapshot,
    initializationState.getSnapshot,
  );

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
