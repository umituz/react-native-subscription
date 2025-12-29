/**
 * Package Handler
 * Handles package operations (fetch, purchase, restore, premium status)
 */

import type { PurchasesPackage, CustomerInfo } from "react-native-purchases";
import type { IRevenueCatService } from "../../application/ports/IRevenueCatService";
import { getPremiumEntitlement } from "../../domain/types/RevenueCatTypes";
import {
  trackPackageError,
  addPackageBreadcrumb,
  trackPackageWarning,
} from "@umituz/react-native-sentry";

export interface PremiumStatus {
  isPremium: boolean;
  expirationDate: Date | null;
}

export interface RestoreResultInfo {
  success: boolean;
  productId: string | null;
}

export class PackageHandler {
  constructor(
    private service: IRevenueCatService | null,
    private entitlementId: string
  ) { }

  setService(service: IRevenueCatService | null): void {
    this.service = service;
  }

  async fetchPackages(): Promise<PurchasesPackage[]> {
    if (!this.service?.isInitialized()) {
      trackPackageWarning("subscription", "Fetch packages called but not initialized", {});
      return [];
    }

    try {
      const offering = await this.service.fetchOfferings();

      if (__DEV__) {
        console.log('[DEBUG PackageHandler] fetchOfferings result:', {
          hasOffering: !!offering,
          identifier: offering?.identifier,
          packagesCount: offering?.availablePackages?.length ?? 0,
          packages: offering?.availablePackages?.map(p => ({
            identifier: p.identifier,
            productIdentifier: p.product.identifier,
            offeringIdentifier: p.offeringIdentifier
          }))
        });
      }

      addPackageBreadcrumb("subscription", "Packages fetched", {
        identifier: offering?.identifier,
        count: offering?.availablePackages?.length ?? 0,
      });

      return offering?.availablePackages ?? [];
    } catch (error) {
      if (__DEV__) {
        console.error('[DEBUG PackageHandler] fetchOfferings failed:', error);
      }
      trackPackageError(error instanceof Error ? error : new Error(String(error)), {
        packageName: "subscription",
        operation: "fetch_packages",
      });
      return [];
    }
  }

  async purchase(pkg: PurchasesPackage, userId: string): Promise<boolean> {
    if (!this.service?.isInitialized()) {
      trackPackageWarning("subscription", "Purchase attempted but not initialized", {
        productId: pkg.product.identifier,
      });
      return false;
    }

    try {
      const result = await this.service.purchasePackage(pkg, userId);
      return result.success;
    } catch (error) {
      trackPackageError(error instanceof Error ? error : new Error(String(error)), {
        packageName: "subscription",
        operation: "purchase",
        userId,
        productId: pkg.product.identifier,
      });
      return false;
    }
  }

  async restore(userId: string): Promise<RestoreResultInfo> {
    if (!this.service?.isInitialized()) {
      trackPackageWarning("subscription", "Restore attempted but not initialized", {});
      return { success: false, productId: null };
    }

    try {
      const result = await this.service.restorePurchases(userId);

      // Extract product ID from active entitlement
      let productId: string | null = null;
      if (result.success && result.customerInfo) {
        const entitlement = getPremiumEntitlement(
          result.customerInfo,
          this.entitlementId
        );
        if (entitlement) {
          productId = entitlement.productIdentifier;
        }
      }

      return { success: result.success, productId };
    } catch (error) {
      trackPackageError(error instanceof Error ? error : new Error(String(error)), {
        packageName: "subscription",
        operation: "restore",
        userId,
      });
      return { success: false, productId: null };
    }
  }

  checkPremiumStatusFromInfo(customerInfo: CustomerInfo): PremiumStatus {
    const entitlement = getPremiumEntitlement(
      customerInfo,
      this.entitlementId
    );

    if (entitlement) {
      return {
        isPremium: true,
        expirationDate: entitlement.expirationDate
          ? new Date(entitlement.expirationDate)
          : null,
      };
    }

    return {
      isPremium: !!customerInfo.entitlements.active[this.entitlementId],
      expirationDate: null,
    };
  }
}
