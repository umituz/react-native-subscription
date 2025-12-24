/**
 * Expiration Date Calculator
 * Handles RevenueCat expiration date extraction
 */

import type { RevenueCatEntitlement } from '../../domain/types/RevenueCatTypes';

export function getExpirationDate(
  entitlement: RevenueCatEntitlement | null
): string | null {
  if (!entitlement) {
    return null;
  }

  if (!entitlement.expirationDate) {
    return null;
  }

  return new Date(entitlement.expirationDate).toISOString();
}
