/**
 * Expiration Date Calculator
 * Handles RevenueCat expiration date extraction with edge case handling
 */

import type { RevenueCatEntitlement } from '../../domain/types/RevenueCatTypes';
import { detectPackageType, type SubscriptionPackageType } from '../../../utils/packageTypeDetector';

/**
 * Add subscription period to a date
 */
function addSubscriptionPeriod(date: Date, packageType: SubscriptionPackageType): Date {
  const newDate = new Date(date);

  switch (packageType) {
    case 'weekly':
      newDate.setDate(newDate.getDate() + 7);
      break;
    case 'monthly':
      newDate.setDate(newDate.getDate() + 30);
      break;
    case 'yearly':
      newDate.setDate(newDate.getDate() + 365);
      break;
    default:
      // Unknown type, default to monthly
      newDate.setDate(newDate.getDate() + 30);
      break;
  }

  return newDate;
}

/**
 * Adjust expiration date if it equals current date
 *
 * RevenueCat sometimes returns expiration date equal to purchase date
 * immediately after purchase. This causes false "expired" status.
 *
 * Solution: If expiration date is today or in the past, add the subscription
 * period (weekly/monthly/yearly) to prevent false expiration.
 */
function adjustExpirationDate(
  expirationDate: string,
  productIdentifier: string
): string {
  const expDate = new Date(expirationDate);
  const now = new Date();

  // If expiration is in the future, no adjustment needed
  if (expDate > now) {
    return expirationDate;
  }

  // If expiration is today or past, add subscription period
  const packageType = detectPackageType(productIdentifier);
  const adjustedDate = addSubscriptionPeriod(expDate, packageType);

  return adjustedDate.toISOString();
}

export function getExpirationDate(
  entitlement: RevenueCatEntitlement | null
): string | null {
  if (!entitlement) {
    return null;
  }

  if (!entitlement.expirationDate) {
    return null;
  }

  // Apply edge case fix for same-day expirations
  return adjustExpirationDate(
    entitlement.expirationDate,
    entitlement.productIdentifier
  );
}
