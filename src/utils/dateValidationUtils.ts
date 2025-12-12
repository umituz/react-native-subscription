/**
 * Date Validation Utilities
 * Utilities for validating and checking subscription dates
 *
 * Following SOLID, DRY, KISS principles:
 * - Single Responsibility: Only date validation logic
 * - DRY: No code duplication
 * - KISS: Simple, clear implementations
 */

import type { SubscriptionStatus } from '../domain/entities/SubscriptionStatus';

/**
 * Check if subscription is expired
 */
export function isSubscriptionExpired(
  status: SubscriptionStatus | null,
): boolean {
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
  const diffDays = Math.ceil(
    diffMs / (1000 * 60 * 60 * 24),
  );

  return Math.max(0, diffDays);
}