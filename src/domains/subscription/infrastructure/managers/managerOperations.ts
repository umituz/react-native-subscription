import type { PurchasesPackage } from "react-native-purchases";
import type { IRevenueCatService } from "../../../../shared/application/ports/IRevenueCatService";
import type { PackageHandler } from "../handlers/PackageHandler";
import type { RestoreResultInfo } from "./SubscriptionManager.types";
import { ensureConfigured, getOrCreateService } from "./subscriptionManagerUtils";
import type { SubscriptionManagerConfig } from "./SubscriptionManager.types";

export const getPackagesOperation = async (
  managerConfig: SubscriptionManagerConfig | null,
  serviceInstance: IRevenueCatService | null,
  packageHandler: PackageHandler
): Promise<PurchasesPackage[]> => {
  ensureConfigured(managerConfig);
  getOrCreateService(serviceInstance);
  return packageHandler.fetchPackages();
};

export const purchasePackageOperation = async (
  pkg: PurchasesPackage,
  managerConfig: SubscriptionManagerConfig | null,
  userId: string,
  packageHandler: PackageHandler
): Promise<boolean> => {
  ensureConfigured(managerConfig);
  const result = await packageHandler.purchase(pkg, userId);
  return result;
};

export const restoreOperation = async (
  managerConfig: SubscriptionManagerConfig | null,
  userId: string,
  packageHandler: PackageHandler
): Promise<RestoreResultInfo> => {
  ensureConfigured(managerConfig);
  return packageHandler.restore(userId);
};
