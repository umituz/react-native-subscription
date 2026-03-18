/**
 * Query cache configurations for optimal performance
 * Uses event-based invalidation via subscriptionEventBus for real-time updates
 */

/**
 * Short-lived cache for frequently changing data (credits, subscription status)
 * Events automatically invalidate the cache, so we can safely cache for 60s
 */
export const SHORT_CACHE_CONFIG = {
  gcTime: 1000 * 60, // 1 minute - keep in memory for 1 minute
  staleTime: 1000 * 30, // 30 seconds - consider stale after 30s
  refetchOnMount: false, // Don't refetch on mount if cache exists
  refetchOnWindowFocus: false, // Don't refetch on app focus
  refetchOnReconnect: true, // Refetch on reconnect only
};

/**
 * Medium cache for relatively stable data (packages, transaction history)
 */
export const MEDIUM_CACHE_CONFIG = {
  gcTime: 1000 * 60 * 5, // 5 minutes
  staleTime: 1000 * 60 * 2, // 2 minutes
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
};

/**
 * Long cache for rarely changing data (config, metadata)
 */
export const LONG_CACHE_CONFIG = {
  gcTime: 1000 * 60 * 30, // 30 minutes
  staleTime: 1000 * 60 * 10, // 10 minutes
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
};
