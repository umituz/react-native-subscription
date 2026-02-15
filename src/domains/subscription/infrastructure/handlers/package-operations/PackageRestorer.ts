import type { IRevenueCatService } from "../../../../../shared/application/ports/IRevenueCatService";
import { getPremiumEntitlement } from "../../../../revenuecat/core/types";
import type { RestoreResultInfo } from "./types";

export async function restorePurchases(
  service: IRevenueCatService,
  userId: string,
  entitlementId: string
): Promise<RestoreResultInfo> {
  if (!service.isInitialized()) {
    throw new Error("Service not initialized");
  }

  const result = await service.restorePurchases(userId);

  if (!result.success) {
    return { success: false, productId: null };
  }

  if (!result.customerInfo) {
    return { success: true, productId: null };
  }

  const entitlement = getPremiumEntitlement(result.customerInfo, entitlementId);

  if (!entitlement) {
    return { success: true, productId: null };
  }

  return {
    success: true,
    productId: entitlement.productIdentifier,
  };
}
