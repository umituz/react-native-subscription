/**
 * Package Handler
 * Handles operations: fetch, purchase, restore
 */

import type { PurchasesPackage, CustomerInfo } from "react-native-purchases";
import type { IRevenueCatService } from "../../application/ports/IRevenueCatService";
import { getPremiumEntitlement } from "../../domain/types/RevenueCatTypes";
import { PurchaseStatusResolver, type PremiumStatus } from "./PurchaseStatusResolver";

export interface RestoreResultInfo {
  success: boolean;
  productId: string | null;
}

export class PackageHandler {
  constructor(
    private service: IRevenueCatService | null,
    private entitlementId: string
  ) { }

  setService = (service: IRevenueCatService | null) => { this.service = service; };

  async fetchPackages(): Promise<PurchasesPackage[]> {
    if (!this.service?.isInitialized()) return [];
    try {
      const offering = await this.service.fetchOfferings();
      return offering?.availablePackages ?? [];
    } catch (error) {
      if (__DEV__) console.error('[PackageHandler] fetchOfferings failed:', error);
      return [];
    }
  }

  async purchase(pkg: PurchasesPackage, userId: string): Promise<boolean> {
    if (!this.service?.isInitialized()) return false;
    try {
      const result = await this.service.purchasePackage(pkg, userId);
      return result.success;
    } catch (error) {
      if (__DEV__) console.error('[PackageHandler] Purchase failed:', error);
      return false;
    }
  }

  async restore(userId: string): Promise<RestoreResultInfo> {
    if (!this.service?.isInitialized()) return { success: false, productId: null };
    try {
      const result = await this.service.restorePurchases(userId);
      let productId: string | null = null;
      if (result.success && result.customerInfo) {
        const entitlement = getPremiumEntitlement(result.customerInfo, this.entitlementId);
        if (entitlement) productId = entitlement.productIdentifier;
      }
      return { success: result.success, productId };
    } catch (error) {
      if (__DEV__) console.error('[PackageHandler] Restore failed:', error);
      return { success: false, productId: null };
    }
  }

  checkPremiumStatusFromInfo(customerInfo: CustomerInfo): PremiumStatus {
    return PurchaseStatusResolver.resolve(customerInfo, this.entitlementId);
  }
}

export type { PremiumStatus };
