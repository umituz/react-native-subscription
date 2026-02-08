/**
 * Initialize Subscription Hook
 * TanStack mutation for initializing RevenueCat
 */

import { useMutation, useQueryClient } from "@umituz/react-native-design-system";
import { SubscriptionManager } from '../../infrastructure/managers/SubscriptionManager';
import { SUBSCRIPTION_QUERY_KEYS } from "./subscriptionQueryKeys";

/**
 * Initialize subscription with RevenueCat
 */
export const useInitializeSubscription = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      return SubscriptionManager.initialize(userId);
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: SUBSCRIPTION_QUERY_KEYS.packages,
        });
      }
    },
  });
};
