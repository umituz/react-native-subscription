/**
 * Subscription Packages Hook
 * TanStack query for fetching available packages
 */

import { useQuery } from "@tanstack/react-query";
import { SubscriptionManager } from "../infrastructure/managers/SubscriptionManager";
import { addPackageBreadcrumb } from "@umituz/react-native-sentry";
import {
  SUBSCRIPTION_QUERY_KEYS,
  STALE_TIME,
  GC_TIME,
} from "./subscriptionQueryKeys";

/**
 * Fetch available subscription packages
 * Works for both authenticated and anonymous users
 */
export const useSubscriptionPackages = (userId: string | undefined) => {
  return useQuery({
    queryKey: [...SUBSCRIPTION_QUERY_KEYS.packages, userId ?? "anonymous"] as const,
    queryFn: async () => {
      addPackageBreadcrumb("subscription", "Fetch packages query started", {
        userId: userId ?? "ANONYMOUS",
      });

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

      const packages = await SubscriptionManager.getPackages();

      addPackageBreadcrumb("subscription", "Fetch packages query success", {
        userId: userId ?? "ANONYMOUS",
        count: packages.length,
      });

      return packages;
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    enabled: true, // Always enabled - works for both authenticated and anonymous users
  });
};
