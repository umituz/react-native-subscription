import type { IRevenueCatService } from "../../../../shared/application/ports/IRevenueCatService";
import type { PackageHandler } from "../handlers/PackageHandler";
import type { PremiumStatus } from "./SubscriptionManager.types";
import { ERROR_MESSAGES } from "./managerConstants";

export const checkPremiumStatusFromService = async (
  service: IRevenueCatService,
  packageHandler: PackageHandler
): Promise<PremiumStatus> => {
  const customerInfo = await service.getCustomerInfo();

  if (!customerInfo) {
    throw new Error(ERROR_MESSAGES.CUSTOMER_INFO_NOT_AVAILABLE);
  }

  return packageHandler.checkPremiumStatusFromInfo(customerInfo);
};
