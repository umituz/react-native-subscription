/**
 * User Switch Core Handler
 *
 * Core user switch logic. Handles switching between anonymous and authenticated users.
 */

import Purchases, { type CustomerInfo } from "react-native-purchases";
import type { InitializeResult } from "../../../shared/application/ports/IRevenueCatService";
import type { InitializerDeps } from "./RevenueCatInitializer.types";
import { FAILED_INITIALIZATION_RESULT } from "./initializerConstants";
import { UserSwitchMutex } from "./UserSwitchMutex";
import { ANONYMOUS_CACHE_KEY } from "../../../subscription/core/SubscriptionConstants";
import {
  normalizeUserId,
  isAnonymousId,
  buildSuccessResult,
  fetchOfferingsSafe,
} from "./userSwitchHelpers";
import { createLogger } from "../../../../../shared/utils/logger";

const logger = createLogger("UserSwitchCore");

/**
 * Handle user switch operation with mutex protection.
 */
export async function handleUserSwitch(
  deps: InitializerDeps,
  userId: string
): Promise<InitializeResult> {
  const mutexKey = userId || ANONYMOUS_CACHE_KEY;

  const { shouldProceed, existingPromise } = await UserSwitchMutex.acquire(mutexKey);

  if (!shouldProceed && existingPromise) {
    logger.debug("Using result from active switch operation");
    return existingPromise as Promise<InitializeResult>;
  }

  const switchOperation = performUserSwitch(deps, userId);
  UserSwitchMutex.setPromise(switchOperation);
  return switchOperation;
}

/**
 * Perform the actual user switch operation.
 */
async function performUserSwitch(
  deps: InitializerDeps,
  userId: string
): Promise<InitializeResult> {
  try {
    const currentAppUserId = await Purchases.getAppUserID();
    const normalizedUserId = normalizeUserId(userId);
    const normalizedCurrentUserId = isAnonymousId(currentAppUserId) ? null : currentAppUserId;

    logger.debug("performUserSwitch", {
      providedUserId: userId,
      normalizedUserId: normalizedUserId || '(null - anonymous)',
      currentAppUserId,
      normalizedCurrentUserId: normalizedCurrentUserId || '(null - anonymous)',
      needsSwitch: normalizedCurrentUserId !== normalizedUserId,
    });

    let customerInfo: CustomerInfo;

    if (normalizedCurrentUserId !== normalizedUserId) {
      if (normalizedUserId) {
        logger.debug("Calling Purchases.logIn() to switch from anonymous to", normalizedUserId);
        const result = await Purchases.logIn(normalizedUserId!);
        customerInfo = result.customerInfo;
        logger.debug("Purchases.logIn() successful, created", result.created);
      } else {
        logger.debug("User is anonymous, fetching customer info");
        customerInfo = await Purchases.getCustomerInfo();
      }
    } else {
      logger.debug("No user switch needed, fetching current customer info");
      customerInfo = await Purchases.getCustomerInfo();
    }

    deps.setInitialized(true);
    deps.setCurrentUserId(normalizedUserId || undefined);
    const offerings = await fetchOfferingsSafe();

    logger.debug("User switch completed successfully");

    return buildSuccessResult(deps, customerInfo, offerings);
  } catch (error) {
    let currentAppUserId = 'unknown';
    try {
      currentAppUserId = await Purchases.getAppUserID();
    } catch {
      // Ignore error in error handler
    }

    logger.error("Failed during user switch or fetch", error, { userId, currentAppUserId });
    return FAILED_INITIALIZATION_RESULT;
  }
}
