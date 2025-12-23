/**
 * Subscription Packages Hook
 * TanStack query for fetching available packages
 */

import { useQuery } from "@tanstack/react-query";
import { SubscriptionManager } from "../../infrastructure/managers/SubscriptionManager";
import { addPackageBreadcrumb } from "@umituz/react-native-sentry";
import {
  SUBSCRIPTION_QUERY_KEYS,
  STALE_TIME,
  GC_TIME,
} from "./subscriptionQueryKeys";

/**
 * Fetch available subscription packages
 */
export const useSubscriptionPackages = (userId: string | undefined) => {
  return useQuery({
    queryKey: [...SUBSCRIPTION_QUERY_KEYS.packages, userId] as const,
    queryFn: async () => {
      addPackageBreadcrumb("subscription", "Fetch packages query started", {
        userId: userId ?? "NO_USER",
      });

      // Skip if already initialized for this specific user
      if (!userId || !SubscriptionManager.isInitializedForUser(userId)) {
        await SubscriptionManager.initialize(userId);
      }

      const packages = await SubscriptionManager.getPackages();

      addPackageBreadcrumb("subscription", "Fetch packages query success", {
        userId: userId ?? "NO_USER",
        count: packages.length,
      });

      return packages;
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    enabled: !!userId, // Only run when userId is available
  });
};
