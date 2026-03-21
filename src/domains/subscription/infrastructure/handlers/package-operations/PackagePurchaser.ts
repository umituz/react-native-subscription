import type { PurchasesPackage } from "react-native-purchases";
import type { IRevenueCatService } from "../../../../../shared/application/ports/IRevenueCatService";
import { createLogger } from "../../../../../shared/utils/logger";

const logger = createLogger("PackagePurchaser");

export async function executePurchase(
  service: IRevenueCatService,
  pkg: PurchasesPackage,
  userId: string
): Promise<boolean> {
  logger.debug("executePurchase called", {
    productId: pkg.product.identifier,
    userId,
    serviceInitialized: service.isInitialized(),
  });

  if (!service.isInitialized()) {
    throw new Error("Service not initialized");
  }

  const result = await service.purchasePackage(pkg, userId);
  return result.success;
}
