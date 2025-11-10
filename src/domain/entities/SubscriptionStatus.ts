/**
 * Subscription Status Entity
 * Represents subscription status for a user
 *
 * SECURITY: This is a read-only entity from database.
 * Never trust client-side subscription status - always validate server-side.
 */

export interface SubscriptionStatus {
  /** Whether user has active subscription */
  isPremium: boolean;

  /** Subscription expiration date (ISO string) */
  expiresAt: string | null;

  /** Product ID of the subscription */
  productId: string | null;

  /** When subscription was purchased (ISO string) */
  purchasedAt: string | null;

  /** External service customer ID (e.g., RevenueCat customer ID) */
  customerId: string | null;

  /** Last sync time with external service (ISO string) */
  syncedAt: string | null;
}

/**
 * Create default subscription status (free user)
 */
export function createDefaultSubscriptionStatus(): SubscriptionStatus {
  return {
    isPremium: false,
    expiresAt: null,
    productId: null,
    purchasedAt: null,
    customerId: null,
    syncedAt: null,
  };
}

/**
 * Check if subscription status is valid (not expired)
 * SECURITY: Always validate expiration server-side
 */
export function isSubscriptionValid(status: SubscriptionStatus | null): boolean {
  if (!status || !status.isPremium) {
    return false;
  }

  if (!status.expiresAt) {
    // Lifetime subscription (no expiration)
    return true;
  }

  const expirationDate = new Date(status.expiresAt);
  const now = new Date();

  // Add 1 day buffer for clock skew and timezone issues
  const bufferMs = 24 * 60 * 60 * 1000;
  return expirationDate.getTime() > now.getTime() - bufferMs;
}

