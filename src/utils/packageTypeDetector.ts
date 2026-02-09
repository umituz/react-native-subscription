/**
 * Package Type Detector
 * Detects subscription package type from RevenueCat package identifier
 */

import { PACKAGE_TYPE, type PackageType } from "../domains/subscription/core/SubscriptionConstants";

export type SubscriptionPackageType = PackageType;

/**
 * Check if identifier is a credit package (consumable purchase)
 * Credit packages use a different system and don't need type detection
 */
export function isCreditPackage(identifier: string): boolean {
  if (!identifier) return false;
  // Matches "credit" as a word or part of a common naming pattern
  // More strict to avoid false positives (e.g. "accredited")
  return /(?:^|[._-])credit(?:$|[._-])/i.test(identifier);
}

/**
 * Detect package type from product identifier
 * Supports common RevenueCat naming patterns with regex for better accuracy
 */
export function detectPackageType(productIdentifier: string): SubscriptionPackageType {
  if (!productIdentifier) {
    return PACKAGE_TYPE.UNKNOWN;
  }

  const normalized = productIdentifier.toLowerCase();

  // Skip credit packages silently - they use creditPackageConfig instead
  if (isCreditPackage(normalized)) {
    return PACKAGE_TYPE.UNKNOWN;
  }

  // Weekly detection: matches "weekly" or "week" as distinct parts of the ID
  if (/\bweekly?\b|_week_|-week-|\.week\./i.test(normalized)) {
    return PACKAGE_TYPE.WEEKLY;
  }

  // Monthly detection: matches "monthly" or "month"
  if (/\bmonthly?\b|_month_|-month-|\.month\./i.test(normalized)) {
    return PACKAGE_TYPE.MONTHLY;
  }

  // Yearly detection: matches "yearly", "year", or "annual"
  if (/\byearly?\b|_year_|-year-|\.year\.|annual/i.test(normalized)) {
    return PACKAGE_TYPE.YEARLY;
  }
  
  // Lifetime detection: matches "lifetime"
  if (/\blifetime\b|_lifetime_|-lifetime-|\.lifetime\./i.test(normalized)) {
      return PACKAGE_TYPE.LIFETIME;
  }

  if (__DEV__ && productIdentifier !== 'unknown_product') {
    console.warn("[PackageTypeDetector] Unknown package type for:", productIdentifier);
  }

  return PACKAGE_TYPE.UNKNOWN;
}
