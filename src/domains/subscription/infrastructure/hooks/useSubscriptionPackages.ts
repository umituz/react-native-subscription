/**
 * Subscription Packages Hook
 * TanStack query for fetching available packages
 * Auth info automatically read from @umituz/react-native-auth
 */

import { useQuery } from "@umituz/react-native-design-system";
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

  return useQuery({
    queryKey: [...SUBSCRIPTION_QUERY_KEYS.packages, userId ?? "anonymous"] as const,
    queryFn: async () => {
      // Initialize if needed (works for both authenticated and anonymous users)
      if (userId) {
        if (!SubscriptionManager.isInitializedForUser(userId)) {
          await SubscriptionManager.initialize(userId);
        }
      } else {
        if (!SubscriptionManager.isInitialized()) {
          await SubscriptionManager.initialize(undefined);
        }
      }

      return SubscriptionManager.getPackages();
    },
    enabled: isConfigured,
    gcTime: 0,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    refetchOnReconnect: "always",
  });
};
