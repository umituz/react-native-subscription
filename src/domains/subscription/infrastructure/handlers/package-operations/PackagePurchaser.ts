import type { PurchasesPackage } from "react-native-purchases";
import type { IRevenueCatService } from "../../../../../shared/application/ports/IRevenueCatService";

export async function executePurchase(
  service: IRevenueCatService,
  pkg: PurchasesPackage,
  userId: string
): Promise<boolean> {
  if (!service.isInitialized()) {
    throw new Error("Service not initialized");
  }

  const result = await service.purchasePackage(pkg, userId);
  return result.success;
}
