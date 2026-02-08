/**
 * Subscription Query Keys
 * TanStack Query keys and constants for subscription state
 */

/** Query cache time constants */


/**
 * Query keys for TanStack Query
 */
export const SUBSCRIPTION_QUERY_KEYS = {
  packages: ["subscription", "packages"] as const,
  initialized: (userId: string) =>
    ["subscription", "initialized", userId] as const,
} as const;


