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
  validatePurchaseReady(deps.isInitialized());

  const consumableIds = deps.config.consumableProductIdentifiers || [];
  const isConsumable = isConsumableProduct(pkg, consumableIds);

  try {
    const result = await executePurchase(deps.config, userId, pkg, isConsumable);
    return result;
  } catch (error) {
    if (isUserCancelledError(error)) {
      return { success: false, isPremium: false, productId: pkg.product.identifier };
    }

    if (isAlreadyPurchasedError(error)) {
      return await handleAlreadyPurchasedError(deps, userId, pkg, error);
    }

    return handlePurchaseError(error, pkg, userId);
  }
}
