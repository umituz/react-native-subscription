/**
 * Subscription Query Keys
 * TanStack Query keys and constants for subscription state
 */

/**
 * Query keys for TanStack Query
 */
export const SUBSCRIPTION_QUERY_KEYS = {
  packages: ["subscription", "packages"] as const,
  initialized: (userId: string) =>
    ["subscription", "initialized", userId] as const,
} as const;

// No cache - always fetch fresh data for subscription packages
// This ensures users always see real-time subscription status
export const STALE_TIME = 0; // Always stale - refetch immediately
export const GC_TIME = 0; // Don't cache - garbage collect immediately
