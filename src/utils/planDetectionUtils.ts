/**
 * Plan Detection Utilities
 * Utilities for detecting subscription plan types from product IDs
 *
 * Following SOLID, DRY, KISS principles:
 * - Single Responsibility: Only plan detection logic
 * - DRY: No code duplication
 * - KISS: Simple, clear implementations
 */

import {
  SUBSCRIPTION_PLAN_TYPES,
  PRODUCT_ID_KEYWORDS,
  type SubscriptionPlanType,
} from './subscriptionConstants';

/**
 * Extract subscription plan type from product ID
 * Example: "com.company.app.weekly" → "weekly"
 * @internal
 */
export function extractPlanFromProductId(
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