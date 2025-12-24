/**
 * Restore Handler
 * Handles RevenueCat restore operations
 */

import Purchases from "react-native-purchases";
import type { RestoreResult } from "@revenuecat/application/ports/IRevenueCatService";
import {
  RevenueCatRestoreError,
  RevenueCatInitializationError,
} from "@revenuecat/domain/errors/RevenueCatError";
import type { RevenueCatConfig } from "@revenuecat/domain/value-objects/RevenueCatConfig";
import { getErrorMessage } from "@revenuecat/domain/types/RevenueCatTypes";
import {
  syncPremiumStatus,
  notifyRestoreCompleted,
} from "@revenuecat/infrastructure/utils/PremiumStatusSyncer";
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
  addPackageBreadcrumb("subscription", "Restore started", { userId });

  if (!deps.isInitialized()) {
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
      await syncPremiumStatus(deps.config, userId, customerInfo);
      addPackageBreadcrumb("subscription", "Restore successful - premium active", {
        userId,
        entitlementId: entitlementIdentifier,
      });
    } else {
      addPackageBreadcrumb("subscription", "Restore completed - no premium found", {
        userId,
      });
    }

    await notifyRestoreCompleted(deps.config, userId, isPremium, customerInfo);

    return { success: isPremium, isPremium, customerInfo };
  } catch (error) {
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
