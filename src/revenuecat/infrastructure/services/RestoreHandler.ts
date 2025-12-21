/**
 * Restore Handler
 * Handles RevenueCat restore operations
 */

import Purchases from "react-native-purchases";
import type { RestoreResult } from "../../application/ports/IRevenueCatService";
import {
  RevenueCatRestoreError,
  RevenueCatInitializationError,
} from "../../domain/errors/RevenueCatError";
import type { RevenueCatConfig } from "../../domain/value-objects/RevenueCatConfig";
import { getErrorMessage } from "../../domain/types/RevenueCatTypes";
import {
  syncPremiumStatus,
  notifyRestoreCompleted,
} from "../utils/PremiumStatusSyncer";
import {
  trackPackageError,
  addPackageBreadcrumb,
} from "@umituz/react-native-sentry";

export interface RestoreHandlerDeps {
  config: RevenueCatConfig;
  isInitialized: () => boolean;
  isUsingTestStore: () => boolean;
}

/**
 * Handle restore purchases
 */
export async function handleRestore(
  deps: RestoreHandlerDeps,
  userId: string
): Promise<RestoreResult> {
  if (__DEV__) console.log("[RevenueCat] Restore started for user:", userId);
  addPackageBreadcrumb("subscription", "Restore started", { userId });

  if (!deps.isInitialized()) {
    if (__DEV__) console.error("[RevenueCat] Restore failed - Not initialized");
    const error = new RevenueCatInitializationError();
    trackPackageError(error, {
      packageName: "subscription",
      operation: "restore",
      userId,
    });
    throw error;
  }

  try {
    const customerInfo = await Purchases.restorePurchases();
    const entitlementIdentifier = deps.config.entitlementIdentifier;
    const isPremium = !!customerInfo.entitlements.active[entitlementIdentifier];

    if (isPremium) {
      if (__DEV__) console.log("[RevenueCat] Restore successful - Premium active");
      await syncPremiumStatus(deps.config, userId, customerInfo);
      addPackageBreadcrumb("subscription", "Restore successful - premium active", {
        userId,
        entitlementId: entitlementIdentifier,
      });
    } else {
      if (__DEV__) console.log("[RevenueCat] Restore completed - No premium found");
      addPackageBreadcrumb("subscription", "Restore completed - no premium found", {
        userId,
      });
    }

    await notifyRestoreCompleted(deps.config, userId, isPremium, customerInfo);

    return { success: isPremium, isPremium, customerInfo };
  } catch (error) {
    if (__DEV__) console.error("[RevenueCat] Restore error:", error);
    const errorMessage = getErrorMessage(error, "Restore failed");
    const restoreError = new RevenueCatRestoreError(errorMessage);
    trackPackageError(restoreError, {
      packageName: "subscription",
      operation: "restore",
      userId,
      originalError: error instanceof Error ? error.message : String(error),
    });
    throw restoreError;
  }
}
