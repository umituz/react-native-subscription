import type { PurchasesPackage, CustomerInfo } from "react-native-purchases";
import type { IRevenueCatService } from "../../../../shared/application/ports/IRevenueCatService";
import { PurchaseStatusResolver, type PremiumStatus } from "./PurchaseStatusResolver";
import {
  fetchPackages,
  executePurchase,
  restorePurchases,
  type RestoreResultInfo,
} from "./package-operations";

export class PackageHandler {
  constructor(
    private service: IRevenueCatService,
    private entitlementId: string
  ) { }

  setService(service: IRevenueCatService): void {
    this.service = service;
  }

  async fetchPackages(): Promise<PurchasesPackage[]> {
    return fetchPackages(this.service);
  }

  async purchase(pkg: PurchasesPackage, userId: string): Promise<boolean> {
    const result = await executePurchase(this.service, pkg, userId);
    return result;
  }

  async restore(userId: string): Promise<RestoreResultInfo> {
    return restorePurchases(this.service, userId, this.entitlementId);
  }

  checkPremiumStatusFromInfo(customerInfo: CustomerInfo): PremiumStatus {
    return PurchaseStatusResolver.resolve(customerInfo, this.entitlementId);
  }
}
