/**
 * Subscription Packages Hook
 * TanStack query for fetching available packages
 */

import { useQuery } from "@tanstack/react-query";
import { SubscriptionManager } from '../../infrastructure/managers/SubscriptionManager';
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
  if (__DEV__) {
    console.log('[DEBUG useSubscriptionPackages] Hook called', { userId: userId || 'ANONYMOUS' });
  }

  return useQuery({
    queryKey: [...SUBSCRIPTION_QUERY_KEYS.packages, userId ?? "anonymous"] as const,
    queryFn: async () => {
      if (__DEV__) {
        console.log('[DEBUG useSubscriptionPackages] QueryFn executing...', { userId: userId || 'ANONYMOUS' });
      }

      addPackageBreadcrumb("subscription", "Fetch packages query started", {
        userId: userId ?? "ANONYMOUS",
      });

      // Initialize if needed (works for both authenticated and anonymous users)
      try {
        if (userId) {
          if (!SubscriptionManager.isInitializedForUser(userId)) {
            if (__DEV__) {
              console.log('[DEBUG useSubscriptionPackages] Initializing for user:', userId);
            }
            await SubscriptionManager.initialize(userId);
          } else {
            if (__DEV__) {
              console.log('[DEBUG useSubscriptionPackages] Already initialized for user:', userId);
            }
          }
        } else {
          if (!SubscriptionManager.isInitialized()) {
            if (__DEV__) {
              console.log('[DEBUG useSubscriptionPackages] Initializing for ANONYMOUS user');
            }
            await SubscriptionManager.initialize(undefined);
          } else {
            if (__DEV__) {
              console.log('[DEBUG useSubscriptionPackages] Already initialized for ANONYMOUS');
            }
          }
        }
      } catch (error) {
        if (__DEV__) {
          console.error('[DEBUG useSubscriptionPackages] Initialization failed:', error);
        }
        throw error;
      }

      if (__DEV__) {
        console.log('[DEBUG useSubscriptionPackages] Calling getPackages...');
      }

      const packages = await SubscriptionManager.getPackages();

      if (__DEV__) {
        console.log('[DEBUG useSubscriptionPackages] Got packages', {
          count: packages.length,
          packages: packages.map(p => ({
            id: p.identifier,
            type: p.packageType,
          })),
        });
      }

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
