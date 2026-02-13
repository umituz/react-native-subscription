import Purchases from "react-native-purchases";
import type { RestoreResult } from "../../../../shared/application/ports/IRevenueCatService";
import {
  RevenueCatRestoreError,
  RevenueCatInitializationError,
  RevenueCatNetworkError,
} from "../../../revenuecat/core/errors";
import type { RevenueCatConfig } from "../../../revenuecat/core/types";
import {
  getRawErrorMessage,
  getErrorCode,
  isNetworkError,
  isInvalidCredentialsError,
} from "../../../revenuecat/core/types";
import { syncPremiumStatus, notifyRestoreCompleted } from "../utils/PremiumStatusSyncer";

export interface RestoreHandlerDeps {
  config: RevenueCatConfig;
  isInitialized: () => boolean;
}

export async function handleRestore(deps: RestoreHandlerDeps, userId: string): Promise<RestoreResult> {
  if (!deps.isInitialized()) throw new RevenueCatInitializationError();

  try {
    const customerInfo = await Purchases.restorePurchases();
    const entitlement = customerInfo.entitlements.active[deps.config.entitlementIdentifier];
    const isPremium = !!entitlement;
    const productId = entitlement?.productIdentifier ?? null;

    if (isPremium) {
      await syncPremiumStatus(deps.config, userId, customerInfo);
    }
    await notifyRestoreCompleted(deps.config, userId, isPremium, customerInfo);

    return { success: true, isPremium, productId, customerInfo };
  } catch (error) {
    // Network error - throw specific error type
    if (isNetworkError(error)) {
      throw new RevenueCatNetworkError(
        "Network error during restore. Please check your internet connection and try again.",
        error instanceof Error ? error : undefined
      );
    }

    // Invalid credentials - configuration error
    if (isInvalidCredentialsError(error)) {
      throw new RevenueCatRestoreError(
        "App configuration error. Please contact support.",
        error instanceof Error ? error : undefined
      );
    }

    // Generic error with code
    const errorCode = getErrorCode(error);
    const errorMessage = getRawErrorMessage(error, "Restore failed");
    const enhancedMessage = errorCode
      ? `${errorMessage} (Code: ${errorCode})`
      : errorMessage;

    throw new RevenueCatRestoreError(
      enhancedMessage,
      error instanceof Error ? error : undefined
    );
  }
}
