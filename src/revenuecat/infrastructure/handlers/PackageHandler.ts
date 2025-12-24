/**
 * Package Handler
 * Handles package operations (fetch, purchase, restore, premium status)
 */

import type { PurchasesPackage } from "react-native-purchases";
import type { IRevenueCatService } from "../application/ports/IRevenueCatService";
import { getPremiumEntitlement } from "../domain/types/RevenueCatTypes";
import {
  trackPackageError,
  addPackageBreadcrumb,
  trackPackageWarning,
} from "@umituz/react-native-sentry";

export interface PremiumStatus {
  isPremium: boolean;
  expirationDate: Date | null;
}

export class PackageHandler {
  constructor(
    private service: IRevenueCatService | null,
    private entitlementId: string
  ) {}

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

      addPackageBreadcrumb("subscription", "Packages fetched", {
        identifier: offering?.identifier,
        count: offering?.availablePackages?.length ?? 0,
      });

      return offering?.availablePackages ?? [];
    } catch (error) {
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

  async restore(userId: string): Promise<boolean> {
    if (!this.service?.isInitialized()) {
      trackPackageWarning("subscription", "Restore attempted but not initialized", {});
      return false;
    }

    try {
      const result = await this.service.restorePurchases(userId);
      return result.success;
    } catch (error) {
      trackPackageError(error instanceof Error ? error : new Error(String(error)), {
        packageName: "subscription",
        operation: "restore",
        userId,
      });
      return false;
    }
  }

  async checkPremiumStatus(userId: string): Promise<PremiumStatus> {
    if (!this.service?.isInitialized()) {
      return { isPremium: false, expirationDate: null };
    }

    try {
      const restoreResult = await this.service.restorePurchases(userId);

      if (restoreResult.customerInfo) {
        const entitlement = getPremiumEntitlement(
          restoreResult.customerInfo,
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
      }

      return { isPremium: restoreResult.isPremium, expirationDate: null };
    } catch (error) {
      trackPackageError(error instanceof Error ? error : new Error(String(error)), {
        packageName: "subscription",
        operation: "check_premium_status",
        userId,
      });
      return { isPremium: false, expirationDate: null };
    }
  }
}
