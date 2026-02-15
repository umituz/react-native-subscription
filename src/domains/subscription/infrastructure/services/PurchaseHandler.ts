import type { PurchasesPackage } from "react-native-purchases";
import type { PurchaseResult } from "../../../../shared/application/ports/IRevenueCatService";
import type { RevenueCatConfig } from "../../../revenuecat/core/types";
import { isUserCancelledError, isAlreadyPurchasedError } from "../../../revenuecat/core/types";
import { validatePurchaseReady, isConsumableProduct } from "./purchase/PurchaseValidator";
import { executePurchase } from "./purchase/PurchaseExecutor";
import { handleAlreadyPurchasedError, handlePurchaseError } from "./purchase/PurchaseErrorHandler";

export interface PurchaseHandlerDeps {
  config: RevenueCatConfig;
  isInitialized: () => boolean;
}

export async function handlePurchase(
  deps: PurchaseHandlerDeps,
  pkg: PurchasesPackage,
  userId: string
): Promise<PurchaseResult> {
  console.log('🔵 [PurchaseHandler] handlePurchase called', {
    productId: pkg.product.identifier,
    userId,
    isInitialized: deps.isInitialized()
  });

  validatePurchaseReady(deps.isInitialized());

  const consumableIds = deps.config.consumableProductIdentifiers || [];
  const isConsumable = isConsumableProduct(pkg, consumableIds);

  console.log('📦 [PurchaseHandler] Product type', { isConsumable });

  try {
    console.log('🚀 [PurchaseHandler] Calling executePurchase');
    const result = await executePurchase(deps.config, userId, pkg, isConsumable);
    console.log('✅ [PurchaseHandler] executePurchase completed', { success: result.success });
    return result;
  } catch (error) {
    console.error('❌ [PurchaseHandler] Purchase failed', { error });

    if (isUserCancelledError(error)) {
      console.log('⚠️ [PurchaseHandler] User cancelled');
      return { success: false, isPremium: false, productId: pkg.product.identifier };
    }

    if (isAlreadyPurchasedError(error)) {
      console.log('⚠️ [PurchaseHandler] Already purchased');
      return await handleAlreadyPurchasedError(deps, userId, pkg, error);
    }

    console.error('❌ [PurchaseHandler] Unhandled error');
    return handlePurchaseError(error, pkg, userId);
  }
}
