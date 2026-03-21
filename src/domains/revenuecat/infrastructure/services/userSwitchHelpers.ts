/**
 * User Switch Helper Functions
 *
 * Utility functions for user switch operations.
 */

import Purchases, { type CustomerInfo, type PurchasesOfferings } from "react-native-purchases";
import type { InitializeResult } from "../../../../shared/application/ports/IRevenueCatService";
import type { InitializerDeps } from "./RevenueCatInitializer.types";
import { ANONYMOUS_CACHE_KEY } from "../../../subscription/core/SubscriptionConstants";
import { createLogger } from "../../../../../shared/utils/logger";

const logger = createLogger("UserSwitchHelpers");

/**
 * Normalize user ID to null if empty or anonymous cache key.
 */
export function normalizeUserId(userId: string): string | null {
  return (userId && userId.length > 0 && userId !== ANONYMOUS_CACHE_KEY) ? userId : null;
}

/**
 * Check if the given user ID is an anonymous RevenueCat ID.
 */
export function isAnonymousId(userId: string): boolean {
  return userId.startsWith('$RCAnonymous') || userId.startsWith('device_');
}

/**
 * Build successful initialization result.
 */
export function buildSuccessResult(
  deps: InitializerDeps,
  customerInfo: CustomerInfo,
  offerings: PurchasesOfferings | null
): InitializeResult {
  const isPremium = !!customerInfo.entitlements.active[deps.config.entitlementIdentifier];
  return { success: true, offering: offerings?.current ?? null, isPremium };
}

/**
 * Fetch offerings separately - non-fatal if it fails.
 *
 * Empty offerings (no products configured in RevenueCat dashboard) should NOT
 * block SDK initialization. The SDK is still usable for premium checks, purchases, etc.
 */
export async function fetchOfferingsSafe(): Promise<PurchasesOfferings | null> {
  try {
    return await Purchases.getOfferings();
  } catch (error) {
    logger.warn("Offerings fetch failed (non-fatal)", error);
    return null;
  }
}
