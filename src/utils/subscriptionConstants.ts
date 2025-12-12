/**
 * Subscription Constants
 * Centralized constants for subscription operations
 *
 * Following SOLID, DRY, KISS principles:
 * - Single Responsibility: Only constants, no logic
 * - DRY: All constants in one place
 * - KISS: Simple, clear constant definitions
 */

/**
 * Subscription plan types
 */
export const SUBSCRIPTION_PLAN_TYPES = {
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
  UNKNOWN: 'unknown',
} as const;

export type SubscriptionPlanType =
  (typeof SUBSCRIPTION_PLAN_TYPES)[keyof typeof SUBSCRIPTION_PLAN_TYPES];

/**
 * Minimum expected subscription durations in days
 * Used to detect sandbox accelerated timers
 * Includes 1 day tolerance for clock skew
 */
export const MIN_SUBSCRIPTION_DURATIONS_DAYS = {
  WEEKLY: 6,
  MONTHLY: 28,
  YEARLY: 360,
  UNKNOWN: 28,
} as const;

/**
 * Subscription period multipliers
 * Days to add for each subscription type
 */
export const SUBSCRIPTION_PERIOD_DAYS = {
  WEEKLY: 7,
} as const;

/**
 * Date calculation constants
 */
export const DATE_CONSTANTS = {
  MILLISECONDS_PER_DAY: 1000 * 60 * 60 * 24,
  DEFAULT_LOCALE: 'en-US',
} as const;

/**
 * Subscription period unit mappings
 * Maps RevenueCat period units to our internal types
 */
export const SUBSCRIPTION_PERIOD_UNITS = {
  WEEK: 'WEEK',
  MONTH: 'MONTH',
  YEAR: 'YEAR',
} as const;

/**
 * Product ID keywords for plan detection
 */
export const PRODUCT_ID_KEYWORDS = {
  WEEKLY: ['weekly', 'week'],
  MONTHLY: ['monthly', 'month'],
  YEARLY: ['yearly', 'year', 'annual'],
} as const;

