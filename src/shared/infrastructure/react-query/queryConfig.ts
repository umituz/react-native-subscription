/**
 * Shared TanStack Query Configuration
 * Common query configurations to ensure consistency across hooks
 */

/**
 * Configuration for queries that should never cache
 * Used for real-time sensitive data (subscriptions, credits, transactions)
 *
 * - gcTime: 0 - Don't keep unused data in memory
 * - staleTime: 0 - Always consider data stale
 * - refetchOnMount: "always" - Always refetch when component mounts
 * - refetchOnWindowFocus: "always" - Always refetch when window regains focus
 * - refetchOnReconnect: "always" - Always refetch when reconnecting
 */
export const NO_CACHE_QUERY_CONFIG = {
  gcTime: 0,
  staleTime: 0,
  refetchOnMount: "always" as const,
  refetchOnWindowFocus: "always" as const,
  refetchOnReconnect: "always" as const,
};
