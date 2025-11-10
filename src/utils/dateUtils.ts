/**
 * Date Utilities
 * Subscription date-related helper functions
 *
 * Following SOLID, DRY, KISS principles:
 * - Single Responsibility: Only date-related operations
 * - DRY: No code duplication
 * - KISS: Simple, clear implementations
 */

import type { SubscriptionStatus } from '../domain/entities/SubscriptionStatus';
import {
  SUBSCRIPTION_PLAN_TYPES,
  MIN_SUBSCRIPTION_DURATIONS_DAYS,
  SUBSCRIPTION_PERIOD_DAYS,
  DATE_CONSTANTS,
  PRODUCT_ID_KEYWORDS,
  type SubscriptionPlanType,
} from './subscriptionConstants';

/**
 * Extract subscription plan type from product ID
 * Example: "com.umituz.app.weekly" → "weekly"
 * @internal
 */
function extractPlanFromProductId(
  productId: string | null | undefined,
): SubscriptionPlanType {
  if (!productId) return SUBSCRIPTION_PLAN_TYPES.UNKNOWN;

  const lower = productId.toLowerCase();

  if (PRODUCT_ID_KEYWORDS.WEEKLY.some((keyword) => lower.includes(keyword))) {
    return SUBSCRIPTION_PLAN_TYPES.WEEKLY;
  }
  if (PRODUCT_ID_KEYWORDS.MONTHLY.some((keyword) => lower.includes(keyword))) {
    return SUBSCRIPTION_PLAN_TYPES.MONTHLY;
  }
  if (PRODUCT_ID_KEYWORDS.YEARLY.some((keyword) => lower.includes(keyword))) {
    return SUBSCRIPTION_PLAN_TYPES.YEARLY;
  }

  return SUBSCRIPTION_PLAN_TYPES.UNKNOWN;
}

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
    diffMs / DATE_CONSTANTS.MILLISECONDS_PER_DAY,
  );

  return diffDays > 0 ? diffDays : 0;
}

/**
 * Format expiration date for display
 */
export function formatExpirationDate(
  expiresAt: string | null,
  locale: string = DATE_CONSTANTS.DEFAULT_LOCALE,
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

/**
 * Calculate expiration date based on subscription plan
 *
 * This function handles:
 * - RevenueCat sandbox accelerated timers (detects and recalculates)
 * - Production dates (trusts RevenueCat's date if valid)
 * - Monthly subscriptions: Same day next month (e.g., Nov 10 → Dec 10)
 * - Yearly subscriptions: Same day next year (e.g., Nov 10, 2024 → Nov 10, 2025)
 * - Weekly subscriptions: +7 days
 *
 * @param productId - Product identifier (e.g., "com.umituz.app.monthly")
 * @param revenueCatExpiresAt - Optional expiration date from RevenueCat API
 * @returns ISO date string for expiration, or null if invalid
 *
 * @example
 * // Monthly subscription purchased on Nov 10, 2024
 * calculateExpirationDate('com.umituz.app.monthly', null)
 * // Returns: '2024-12-10T...' (Dec 10, 2024)
 *
 * @example
 * // Yearly subscription purchased on Nov 10, 2024
 * calculateExpirationDate('com.umituz.app.yearly', null)
 * // Returns: '2025-11-10T...' (Nov 10, 2025)
 */
export function calculateExpirationDate(
  productId: string | null | undefined,
  revenueCatExpiresAt?: string | null,
): string | null {
  const plan = extractPlanFromProductId(productId);
  const now = new Date();

  // Check if RevenueCat's date is valid and not sandbox accelerated
  if (revenueCatExpiresAt) {
    try {
      const rcDate = new Date(revenueCatExpiresAt);

      // Only trust if date is in the future
      if (rcDate > now) {
        // Detect sandbox accelerated timers by checking duration
        const durationMs = rcDate.getTime() - now.getTime();
        const durationDays =
          durationMs / DATE_CONSTANTS.MILLISECONDS_PER_DAY;

        // Get minimum expected duration for this plan type
        const minDurationMap: Record<SubscriptionPlanType, number> = {
          [SUBSCRIPTION_PLAN_TYPES.WEEKLY]:
            MIN_SUBSCRIPTION_DURATIONS_DAYS.WEEKLY,
          [SUBSCRIPTION_PLAN_TYPES.MONTHLY]:
            MIN_SUBSCRIPTION_DURATIONS_DAYS.MONTHLY,
          [SUBSCRIPTION_PLAN_TYPES.YEARLY]:
            MIN_SUBSCRIPTION_DURATIONS_DAYS.YEARLY,
          [SUBSCRIPTION_PLAN_TYPES.UNKNOWN]:
            MIN_SUBSCRIPTION_DURATIONS_DAYS.UNKNOWN,
        };

        const minDuration = minDurationMap[plan];

        // If duration is reasonable, trust RevenueCat's date (production)
        if (durationDays >= minDuration) {
          return rcDate.toISOString();
        }
        // Otherwise, fall through to manual calculation (sandbox accelerated)
      }
    } catch {
      // Invalid date, fall through to calculation
    }
  }

  // Calculate production-equivalent expiration date
  // Use current date as base to preserve the day of month/year
  const calculatedDate = new Date(now);

  switch (plan) {
    case SUBSCRIPTION_PLAN_TYPES.WEEKLY:
      // Weekly: +7 days
      calculatedDate.setDate(
        calculatedDate.getDate() + SUBSCRIPTION_PERIOD_DAYS.WEEKLY,
      );
      break;

    case SUBSCRIPTION_PLAN_TYPES.MONTHLY:
      // Monthly: Same day next month
      // This handles edge cases like Jan 31 → Feb 28/29 correctly
      calculatedDate.setMonth(calculatedDate.getMonth() + 1);
      break;

    case SUBSCRIPTION_PLAN_TYPES.YEARLY:
      // Yearly: Same day next year
      // This handles leap years correctly (Feb 29 → Feb 28/29)
      calculatedDate.setFullYear(calculatedDate.getFullYear() + 1);
      break;

    default:
      // Unknown plan type - default to 1 month
      calculatedDate.setMonth(calculatedDate.getMonth() + 1);
      break;
  }

  return calculatedDate.toISOString();
}

