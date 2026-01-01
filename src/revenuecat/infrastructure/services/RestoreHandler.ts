/**
 * Restore Handler
 * Handles RevenueCat restore operations
 */

import Purchases from "react-native-purchases";
import type { RestoreResult } from '../../application/ports/IRevenueCatService';
import {
  RevenueCatRestoreError,
  RevenueCatInitializationError,
} from '../../domain/errors/RevenueCatError';
import type { RevenueCatConfig } from '../../domain/value-objects/RevenueCatConfig';
import { getErrorMessage } from '../../domain/types/RevenueCatTypes';
import {
  syncPremiumStatus,
  notifyRestoreCompleted,
} from '../utils/PremiumStatusSyncer';
import {

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

  if (!deps.isInitialized()) {
    const error = new RevenueCatInitializationError();
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
        userId,
        entitlementId: entitlementIdentifier,
      });
    } else {
        userId,
      });
    }

    await notifyRestoreCompleted(deps.config, userId, isPremium, customerInfo);

    return { success: isPremium, isPremium, customerInfo };
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Restore failed");
    const restoreError = new RevenueCatRestoreError(errorMessage);
      packageName: "subscription",
      operation: "restore",
      userId,
      originalError: error instanceof Error ? error.message : String(error),
    });
    throw restoreError;
  }
}
