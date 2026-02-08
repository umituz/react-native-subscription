/**
 * Package Handler
 * Handles operations: fetch, purchase, restore
 */

import type { PurchasesPackage, CustomerInfo } from "react-native-purchases";
import type { IRevenueCatService } from "../../../../shared/application/ports/IRevenueCatService";
import { getPremiumEntitlement } from "../../core/RevenueCatTypes";
import { PurchaseStatusResolver, type PremiumStatus } from "./PurchaseStatusResolver";

export interface RestoreResultInfo {
  success: boolean;
  productId: string | null;
}

export class PackageHandler {
  constructor(
    private service: IRevenueCatService,
    private entitlementId: string
  ) { }

  setService(service: IRevenueCatService): void {
    this.service = service;
  }

  async fetchPackages(): Promise<PurchasesPackage[]> {
    if (!this.service.isInitialized()) {
      throw new Error("Service not initialized. Please initialize before fetching packages.");
    }

    try {
      const offering = await this.service.fetchOfferings();

      if (!offering) {
        // Return empty array instead of throwing - allows graceful degradation
        return [];
      }

      const packages = offering.availablePackages;
      if (!packages || packages.length === 0) {
        // Return empty array instead of throwing - allows graceful degradation
        return [];
      }

      return packages;
    } catch (error) {
      // Re-throw with more context
      throw new Error(
        `Failed to fetch subscription packages. ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async purchase(pkg: PurchasesPackage, userId: string): Promise<boolean> {
    if (!this.service.isInitialized()) {
      throw new Error("Service not initialized");
    }

    const result = await this.service.purchasePackage(pkg, userId);
    return result.success;
  }

  async restore(userId: string): Promise<RestoreResultInfo> {
    if (!this.service.isInitialized()) {
      throw new Error("Service not initialized");
    }

    const result = await this.service.restorePurchases(userId);

    if (!result.success) {
      return { success: false, productId: null };
    }

    if (!result.customerInfo) {
      return { success: true, productId: null };
    }

    const entitlement = getPremiumEntitlement(result.customerInfo, this.entitlementId);

    if (!entitlement) {
      return { success: true, productId: null };
    }

    return {
      success: true,
      productId: entitlement.productIdentifier,
    };
  }

  checkPremiumStatusFromInfo(customerInfo: CustomerInfo): PremiumStatus {
    return PurchaseStatusResolver.resolve(customerInfo, this.entitlementId);
  }
}

export type { PremiumStatus };
