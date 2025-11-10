/**
 * Subscription Utilities
 * Helper functions for subscription operations
 */

import type { SubscriptionStatus } from '../domain/entities/SubscriptionStatus';

/**
 * Check if subscription is expired
 */
export function isSubscriptionExpired(status: SubscriptionStatus | null): boolean {
  if (!status || !status.isPremium) {
    return true;
  }

  if (!status.expiresAt) {
    // Lifetime subscription (no expiration)
    return false;
  }

  const expirationDate = new Date(status.expiresAt);
  const now = new Date();

  return expirationDate.getTime() <= now.getTime();
}

/**
 * Get days until subscription expires
 * Returns null for lifetime subscriptions
 */
export function getDaysUntilExpiration(
  status: SubscriptionStatus | null,
): number | null {
  if (!status || !status.expiresAt) {
    return null;
  }

  const expirationDate = new Date(status.expiresAt);
  const now = new Date();
  const diffMs = expirationDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
}

/**
 * Format expiration date for display
 */
export function formatExpirationDate(
  expiresAt: string | null,
  locale: string = 'en-US',
): string | null {
  if (!expiresAt) {
    return null;
  }

  try {
    const date = new Date(expiresAt);
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return null;
  }
}

