import type { QueryClient } from "@tanstack/react-query";
import { SUBSCRIPTION_QUERY_KEYS } from "../../../../domains/subscription/infrastructure/hooks/subscriptionQueryKeys";
import { subscriptionStatusQueryKeys } from "../../../../domains/subscription/presentation/useSubscriptionStatus";
import { creditsQueryKeys } from "../../../../domains/credits/presentation/creditsQueryKeys";

/**
 * Centralized cache invalidation utilities for subscription-related queries.
 * This ensures consistent cache invalidation across all mutations and removes code duplication.
 */

/**
 * Invalidate all subscription-related caches for a specific user.
 * This includes:
 * - Subscription packages
 * - Subscription status
 * - Credits
 *
 * @param queryClient - TanStack Query client instance
 * @param userId - User ID to invalidate caches for
 */
export function invalidateSubscriptionCaches(
  queryClient: QueryClient,
  userId: string | null | undefined
): void {
  if (!userId) {
    return;
  }

  // Invalidate packages (global, not user-specific)
  queryClient.invalidateQueries({
    queryKey: SUBSCRIPTION_QUERY_KEYS.packages,
  });

  // Invalidate subscription status (user-specific)
  queryClient.invalidateQueries({
    queryKey: subscriptionStatusQueryKeys.user(userId),
  });

  // Invalidate credits (user-specific)
  queryClient.invalidateQueries({
    queryKey: creditsQueryKeys.user(userId),
  });
}

/**
 * Invalidate only subscription status cache.
 * Use this when only subscription status changes, not credits.
 *
 * @param queryClient - TanStack Query client instance
 * @param userId - User ID to invalidate cache for
 */
export function invalidateSubscriptionStatus(
  queryClient: QueryClient,
  userId: string | null | undefined
): void {
  if (!userId) {
    return;
  }

  queryClient.invalidateQueries({
    queryKey: subscriptionStatusQueryKeys.user(userId),
  });
}

/**
 * Invalidate only credits cache.
 * Use this when only credits change, not subscription status.
 *
 * @param queryClient - TanStack Query client instance
 * @param userId - User ID to invalidate cache for
 */
export function invalidateCredits(
  queryClient: QueryClient,
  userId: string | null | undefined
): void {
  if (!userId) {
    return;
  }

  queryClient.invalidateQueries({
    queryKey: creditsQueryKeys.user(userId),
  });
}

/**
 * Invalidate all caches for a user (subscription + credits).
 * Alias for invalidateSubscriptionCaches for better semantic clarity.
 *
 * @param queryClient - TanStack Query client instance
 * @param userId - User ID to invalidate caches for
 */
export function invalidateAllUserData(
  queryClient: QueryClient,
  userId: string | null | undefined
): void {
  invalidateSubscriptionCaches(queryClient, userId);
}
