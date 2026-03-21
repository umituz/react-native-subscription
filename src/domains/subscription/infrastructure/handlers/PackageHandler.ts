import type { PurchasesPackage, CustomerInfo } from "react-native-purchases";
import type { IRevenueCatService } from "../../../shared/application/ports/IRevenueCatService";
import { PurchaseStatusResolver, type PremiumStatus } from "./PurchaseStatusResolver";
import { fetchPackages } from "./package-operations/PackageFetcher";
import { executePurchase } from "./package-operations/PackagePurchaser";
import { restorePurchases } from "./package-operations/PackageRestorer";
import type { RestoreResultInfo } from "./package-operations/types";

export class PackageHandler {
  constructor(
    private service: IRevenueCatService,
    private entitlementId: string
  ) { }

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
