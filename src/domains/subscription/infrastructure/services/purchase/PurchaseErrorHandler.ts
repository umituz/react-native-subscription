import type { PurchasesPackage } from "react-native-purchases";
import type { PurchaseResult } from "../../../../../shared/application/ports/IRevenueCatService";
import {
  RevenueCatPurchaseError,
  RevenueCatNetworkError,
} from "../../../../revenuecat/core/errors/RevenueCatError";
import {
  isUserCancelledError,
  isNetworkError,
  isInvalidCredentialsError,
  getRawErrorMessage,
  getErrorCode,
} from "../../../../revenuecat/core/types/RevenueCatTypes";
import { getSavedPurchase, clearSavedPurchase } from "../../../presentation/useAuthAwarePurchase";
import { notifyPurchaseCompleted } from "../../utils/PremiumStatusSyncer";
import { handleRestore } from "../RestoreHandler";
import type { PurchaseHandlerDeps } from "../PurchaseHandler";
import { createLogger } from "../../../../../shared/utils/logger";

const logger = createLogger("PurchaseErrorHandler");

export async function handleAlreadyPurchasedError(
  deps: PurchaseHandlerDeps,
  userId: string,
  pkg: PurchasesPackage,
  error: unknown
): Promise<PurchaseResult> {
  try {
    const restoreResult = await handleRestore(deps, userId);
    // restoreResult.success is always true here (handleRestore throws on error)
    // and restoreResult.customerInfo is always present (RevenueCat guarantees it)
    if (restoreResult.isPremium && restoreResult.customerInfo) {
      await notifyPurchaseCompleted(
        deps.config,
        userId,
        pkg.product.identifier,
        restoreResult.customerInfo,
        getSavedPurchase()?.source
      );
    }
    clearSavedPurchase();
    return {
      success: true,
      isPremium: restoreResult.isPremium ?? false,
      customerInfo: restoreResult.customerInfo,
      productId: restoreResult.productId ?? pkg.product.identifier,
    };
  } catch (_restoreError) {
    throw new RevenueCatPurchaseError(
      "You already own this subscription, but restore failed. Please try restoring purchases manually.",
      pkg.product.identifier,
      error instanceof Error ? error : undefined
    );
  }
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
  const errorMessage = getRawErrorMessage(error);
  const enhancedMessage = errorCode
    ? `${errorMessage} (Code: ${errorCode})`
    : errorMessage;

  logger.error("Purchase failed", error, {
    productId: pkg.product.identifier,
    userId,
    errorCode,
  });

  throw new RevenueCatPurchaseError(
    enhancedMessage,
    pkg.product.identifier,
    error instanceof Error ? error : undefined
  );
}
