/**
 * Subscription TanStack Query Hooks
 * Server state management for RevenueCat subscriptions
 * Generic hooks for 100+ apps
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PurchasesPackage } from "react-native-purchases";
import { SubscriptionManager } from "../../infrastructure/managers/SubscriptionManager";
import {
  trackPackageError,
  addPackageBreadcrumb,
} from "@umituz/react-native-sentry";

/**
 * Query keys for TanStack Query
 */
export const SUBSCRIPTION_QUERY_KEYS = {
  packages: ["subscription", "packages"] as const,
  initialized: (userId: string) =>
    ["subscription", "initialized", userId] as const,
} as const;

const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const GC_TIME = 30 * 60 * 1000; // 30 minutes

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

      addPackageBreadcrumb("subscription", "Initialize mutation started", {
        userId,
      });

      return SubscriptionManager.initialize(userId);
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: SUBSCRIPTION_QUERY_KEYS.packages,
        });

        addPackageBreadcrumb(
          "subscription",
          "Initialize mutation success - packages invalidated",
          { userId }
        );
      }
    },
    onError: (error) => {
      trackPackageError(
        error instanceof Error ? error : new Error(String(error)),
        {
          packageName: "subscription",
          operation: "initialize_mutation",
          userId: userId ?? "NO_USER",
        }
      );
    },
  });
};

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

/**
 * Purchase a subscription package
 */
export const usePurchasePackage = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pkg: PurchasesPackage) => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      addPackageBreadcrumb("subscription", "Purchase started", {
        packageId: pkg.identifier,
        userId,
      });

      addPackageBreadcrumb("subscription", "Purchase mutation started", {
        packageId: pkg.identifier,
        userId,
      });

      const success = await SubscriptionManager.purchasePackage(pkg);

      if (success) {
        addPackageBreadcrumb("subscription", "Purchase success", {
          packageId: pkg.identifier,
          userId,
        });

        addPackageBreadcrumb("subscription", "Purchase mutation success", {
          packageId: pkg.identifier,
          userId,
        });
      } else {
        addPackageBreadcrumb("subscription", "Purchase cancelled", {
          packageId: pkg.identifier,
          userId,
        });

        addPackageBreadcrumb("subscription", "Purchase mutation failed", {
          packageId: pkg.identifier,
          userId,
        });
      }

      return success;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SUBSCRIPTION_QUERY_KEYS.packages,
      });
    },
    onError: (error) => {
      trackPackageError(
        error instanceof Error ? error : new Error(String(error)),
        {
          packageName: "subscription",
          operation: "purchase_mutation",
          userId: userId ?? "NO_USER",
        }
      );
    },
  });
};

/**
 * Restore previous purchases
 */
export const useRestorePurchase = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      addPackageBreadcrumb("subscription", "Restore started", {
        userId,
      });

      addPackageBreadcrumb("subscription", "Restore mutation started", {
        userId,
      });

      const success = await SubscriptionManager.restore();

      if (success) {
        addPackageBreadcrumb("subscription", "Restore success", {
          userId,
        });

        addPackageBreadcrumb("subscription", "Restore mutation success", {
          userId,
        });
      } else {
        addPackageBreadcrumb("subscription", "Restore mutation failed", {
          userId,
        });
      }

      return success;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SUBSCRIPTION_QUERY_KEYS.packages,
      });
    },
    onError: (error) => {
      trackPackageError(
        error instanceof Error ? error : new Error(String(error)),
        {
          packageName: "subscription",
          operation: "restore_mutation",
          userId: userId ?? "NO_USER",
        }
      );
    },
  });
};
