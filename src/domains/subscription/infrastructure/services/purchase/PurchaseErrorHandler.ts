import type { PurchasesPackage } from "react-native-purchases";
import type { PurchaseResult } from "../../../../../shared/application/ports/IRevenueCatService";
import {
  RevenueCatPurchaseError,
  RevenueCatNetworkError,
} from "../../../../revenuecat/core/errors";
import {
  isUserCancelledError,
  isNetworkError,
  isAlreadyPurchasedError,
  isInvalidCredentialsError,
  getRawErrorMessage,
  getErrorCode,
} from "../../../../revenuecat/core/types";
import { getSavedPurchase, clearSavedPurchase } from "../../../presentation/useAuthAwarePurchase";
import { notifyPurchaseCompleted } from "../../utils/PremiumStatusSyncer";
import { handleRestore } from "../RestoreHandler";
import type { PurchaseHandlerDeps } from "../PurchaseHandler";

export async function handleAlreadyPurchasedError(
  deps: PurchaseHandlerDeps,
  userId: string,
  pkg: PurchasesPackage,
  error: unknown
): Promise<PurchaseResult> {
  try {
    const restoreResult = await handleRestore(deps, userId);
    if (restoreResult.success && restoreResult.isPremium && restoreResult.customerInfo) {
      await notifyPurchaseCompleted(
        deps.config,
        userId,
        pkg.product.identifier,
        restoreResult.customerInfo,
        getSavedPurchase()?.source
      );
      clearSavedPurchase();
      return {
        success: true,
        isPremium: true,
        customerInfo: restoreResult.customerInfo,
        productId: restoreResult.productId || pkg.product.identifier,
      };
    }
  } catch (_restoreError) {
    throw new RevenueCatPurchaseError(
      "You already own this subscription, but restore failed. Please try restoring purchases manually.",
      pkg.product.identifier,
      error instanceof Error ? error : undefined
    );
  }

  throw new RevenueCatPurchaseError(
    "You already own this subscription, but it could not be activated.",
    pkg.product.identifier,
    error instanceof Error ? error : undefined
  );
}

export function handlePurchaseError(
  error: unknown,
  pkg: PurchasesPackage,
  userId: string
): never {
  if (isUserCancelledError(error)) {
    throw new RevenueCatPurchaseError(
      "Purchase cancelled",
      pkg.product.identifier,
      error instanceof Error ? error : undefined
    );
  }

  if (isNetworkError(error)) {
    throw new RevenueCatNetworkError(
      "Network error during purchase. Please check your internet connection and try again.",
      error instanceof Error ? error : undefined
    );
  }

  if (isInvalidCredentialsError(error)) {
    throw new RevenueCatPurchaseError(
      "App configuration error. Please contact support.",
      pkg.product.identifier,
      error instanceof Error ? error : undefined
    );
  }

  const errorCode = getErrorCode(error);
  const errorMessage = getRawErrorMessage(error, "Purchase failed");
  const enhancedMessage = errorCode
    ? `${errorMessage} (Code: ${errorCode})`
    : errorMessage;

  console.error('[PurchaseHandler] Purchase failed', {
    productId: pkg.product.identifier,
    userId,
    errorCode,
    error,
  });

  throw new RevenueCatPurchaseError(
    enhancedMessage,
    pkg.product.identifier,
    error instanceof Error ? error : undefined
  );
}
