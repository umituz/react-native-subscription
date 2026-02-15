/**
 * Query Invalidation Utilities
 * Centralized functions for invalidating multiple related queries
 */

import type { QueryClient } from "@umituz/react-native-design-system";
import { creditsQueryKeys } from "../../../domains/credits/presentation/creditsQueryKeys";
import { subscriptionStatusQueryKeys } from "../../../domains/subscription/presentation/useSubscriptionStatus";

// Subscription packages query key
export const SUBSCRIPTION_QUERY_KEYS = {
  packages: ["subscription", "packages"] as const,
};

/**
 * Invalidates all subscription-related queries
 * Use after purchases, restores, or subscription changes
 *
 * @param queryClient - TanStack Query client
 * @param userId - Optional user ID to invalidate user-specific queries
 *
 * @example
 * // After successful purchase
 * await invalidateSubscriptionQueries(queryClient, userId);
 */
export async function invalidateSubscriptionQueries(
  queryClient: QueryClient,
  userId?: string | null
): Promise<void> {
  // Invalidate packages (affects all users)
  await queryClient.invalidateQueries({
    queryKey: SUBSCRIPTION_QUERY_KEYS.packages,
  });

  // Invalidate user-specific queries if userId provided
  if (userId) {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: subscriptionStatusQueryKeys.user(userId),
      }),
      queryClient.invalidateQueries({
        queryKey: creditsQueryKeys.user(userId),
      }),
    ]);
  }
}
