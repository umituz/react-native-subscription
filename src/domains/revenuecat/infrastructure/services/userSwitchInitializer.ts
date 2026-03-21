/**
 * User Switch Initializer
 *
 * Handles initial RevenueCat SDK configuration and user data fetching.
 */

import Purchases, { type CustomerInfo } from "react-native-purchases";
import type { InitializeResult } from "../../../shared/application/ports/IRevenueCatService";
import type { InitializerDeps } from "./RevenueCatInitializer.types";
import { FAILED_INITIALIZATION_RESULT } from "./initializerConstants";
import { getPremiumEntitlement } from "../../core/types/RevenueCatTypes";
import type { PeriodType } from "../../../subscription/core/SubscriptionConstants";
import {
  normalizeUserId,
  buildSuccessResult,
  fetchOfferingsSafe,
} from "./userSwitchHelpers";
import { createLogger } from "../../../../../shared/utils/logger";

const logger = createLogger("UserSwitchInitializer");

/**
 * Handle initial SDK configuration with API key and user ID.
 */
export async function handleInitialConfiguration(
  deps: InitializerDeps,
  userId: string,
  apiKey: string
): Promise<InitializeResult> {
  try {
    const normalizedUserId = normalizeUserId(userId);

    logger.debug("handleInitialConfiguration", {
      providedUserId: userId,
      normalizedUserId: normalizedUserId || '(null - anonymous)',
      apiKeyPrefix: apiKey.substring(0, 5) + '...',
      isTestKey: apiKey.startsWith('test_'),
    });

    Purchases.setLogLevel(
      (typeof __DEV__ !== 'undefined' && __DEV__)
        ? Purchases.LOG_LEVEL.INFO
        : Purchases.LOG_LEVEL.ERROR
    );

    await Purchases.configure({ apiKey, appUserID: normalizedUserId || undefined });
    deps.setInitialized(true);
    deps.setCurrentUserId(normalizedUserId || undefined);

    logger.debug("Purchases.configure() successful");

    const [customerInfo, offerings] = await Promise.all([
      Purchases.getCustomerInfo(),
      fetchOfferingsSafe(),
    ]);

    const currentUserId = await Purchases.getAppUserID();
    logger.debug("Initial configuration completed", {
      revenueCatUserId: currentUserId,
      activeEntitlements: Object.keys(customerInfo.entitlements.active),
      offeringsCount: offerings?.all ? Object.keys(offerings.all).length : 0,
    });

    await syncPremiumStatusIfConfigured(deps, normalizedUserId, customerInfo);

    return buildSuccessResult(deps, customerInfo, offerings);
  } catch (error) {
    logger.error("SDK configuration failed", error, { userId });
    return FAILED_INITIALIZATION_RESULT;
  }
}

/**
 * Fetch current user data without switching users.
 */
export async function fetchCurrentUserData(deps: InitializerDeps): Promise<InitializeResult> {
  try {
    const [customerInfo, offerings] = await Promise.all([
      Purchases.getCustomerInfo(),
      fetchOfferingsSafe(),
    ]);
    return buildSuccessResult(deps, customerInfo, offerings);
  } catch (error) {
    logger.error("Failed to fetch customer info for initialized user", error);
    return FAILED_INITIALIZATION_RESULT;
  }
}

/**
 * Sync premium status to callback if configured.
 * Only when we have a real Firebase UID — skip for pre-auth anonymous state.
 */
async function syncPremiumStatusIfConfigured(
  deps: InitializerDeps,
  normalizedUserId: string | null,
  customerInfo: CustomerInfo
): Promise<void> {
  if (!deps.config.onPremiumStatusChanged || !normalizedUserId) {
    return;
  }

  try {
    const premiumEntitlement = getPremiumEntitlement(
      customerInfo,
      deps.config.entitlementIdentifier
    );

    if (premiumEntitlement) {
      const subscription = customerInfo.subscriptionsByProductIdentifier?.[premiumEntitlement.productIdentifier];

      await deps.config.onPremiumStatusChanged({
        userId: normalizedUserId,
        isPremium: true,
        productId: premiumEntitlement.productIdentifier,
        expirationDate: premiumEntitlement.expirationDate ?? null,
        willRenew: premiumEntitlement.willRenew,
        periodType: premiumEntitlement.periodType as PeriodType | undefined,
        storeTransactionId: subscription?.storeTransactionId ?? undefined,
        unsubscribeDetectedAt: premiumEntitlement.unsubscribeDetectedAt ?? null,
        billingIssueDetectedAt: premiumEntitlement.billingIssueDetectedAt ?? null,
        store: premiumEntitlement.store ?? null,
        ownershipType: premiumEntitlement.ownershipType ?? null,
      });
    } else {
      await deps.config.onPremiumStatusChanged({
        userId: normalizedUserId,
        isPremium: false,
      });
    }
  } catch (error) {
    logger.error("Premium status sync callback failed", error);
  }
}
