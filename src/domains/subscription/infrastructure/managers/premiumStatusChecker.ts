import type { IRevenueCatService } from "../../../../shared/application/ports/IRevenueCatService";
import type { PackageHandler } from "../handlers/PackageHandler";
import type { PremiumStatus } from "./SubscriptionManager.types";

export const checkPremiumStatusFromService = async (
  service: IRevenueCatService,
  packageHandler: PackageHandler
): Promise<PremiumStatus> => {
  const customerInfo = await service.getCustomerInfo();

  if (!customerInfo) {
    throw new Error("Customer info not available");
  }

  return packageHandler.checkPremiumStatusFromInfo(customerInfo);
};
