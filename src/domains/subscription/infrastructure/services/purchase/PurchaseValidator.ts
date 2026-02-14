import type { PurchasesPackage } from "react-native-purchases";
import { RevenueCatInitializationError } from "../../../../revenuecat/core/errors";

export function validatePurchaseReady(isInitialized: boolean): void {
  if (!isInitialized) {
    throw new RevenueCatInitializationError();
  }
}

export function isConsumableProduct(pkg: PurchasesPackage, consumableIds: string[]): boolean {
  if (consumableIds.length === 0) return false;
  const identifier = pkg.product.identifier.toLowerCase();
  return consumableIds.some((id) => identifier.includes(id.toLowerCase()));
}
