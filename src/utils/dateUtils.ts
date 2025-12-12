/**
 * Date Utilities
 * Subscription date-related helper functions
 *
 * Following SOLID, DRY, KISS principles:
 * - Single Responsibility: Only date formatting and calculation
 * - DRY: No code duplication
 * - KISS: Simple, clear implementations
 */

import { DATE_CONSTANTS } from './subscriptionConstants';
import { extractPlanFromProductId } from './planDetectionUtils';
import {
  SUBSCRIPTION_PLAN_TYPES,
  MIN_SUBSCRIPTION_DURATIONS_DAYS,
  SUBSCRIPTION_PERIOD_DAYS,
  type SubscriptionPlanType,
} from './subscriptionConstants';

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
    if (isNaN(date.getTime())) {
      return null;
    }
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
 * @param productId - Product identifier (e.g., "com.company.app.monthly")
 * @param revenueCatExpiresAt - Optional expiration date from RevenueCat API
 * @returns ISO date string for expiration, or null if invalid
 *
 * @example
 * // Monthly subscription purchased on Nov 10, 2024
 * calculateExpirationDate('com.company.app.monthly', null)
 * // Returns: '2024-12-10T...' (Dec 10, 2024)
 *
 * @example
 * // Yearly subscription purchased on Nov 10, 2024
 * calculateExpirationDate('com.company.app.yearly', null)
 * // Returns: '2025-11-10T...' (Nov 10, 2025)
 */
export function calculateExpirationDate(
  productId: string | null | undefined,
  revenueCatExpiresAt?: string | null,
): string | null {
  if (!productId) return null;
  
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