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

export const STALE_TIME = 5 * 60 * 1000; // 5 minutes
export const GC_TIME = 30 * 60 * 1000; // 30 minutes
