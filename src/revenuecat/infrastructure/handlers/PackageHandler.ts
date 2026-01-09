/**
 * Package Handler
 * Handles package operations (fetch, purchase, restore, premium status)
 */

import type { PurchasesPackage, CustomerInfo } from "react-native-purchases";
import type { IRevenueCatService } from "../../application/ports/IRevenueCatService";
import { getPremiumEntitlement } from "../../domain/types/RevenueCatTypes";
import { getExpirationDate } from "../utils/ExpirationDateCalculator";

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

      return offering?.availablePackages ?? [];
    } catch (error) {
      if (__DEV__) {
        console.error('[DEBUG PackageHandler] fetchOfferings failed:', error);
      }
      return [];
    }
  }

  async purchase(pkg: PurchasesPackage, userId: string): Promise<boolean> {
    if (!this.service?.isInitialized()) {
      if (__DEV__) {
        console.log('[DEBUG PackageHandler] Service not initialized', {
          productId: pkg.product.identifier,
        });
      }
      return false;
    }

    try {
      const result = await this.service.purchasePackage(pkg, userId);
      return result.success;
    } catch (error) {
      if (__DEV__) {
        console.error('[DEBUG PackageHandler] Purchase failed:', {
          error,
          productId: pkg.product.identifier,
        });
      }
      return false;
    }
  }

  async restore(userId: string): Promise<RestoreResultInfo> {
    if (!this.service?.isInitialized()) {
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
      if (__DEV__) {
        console.error('[DEBUG PackageHandler] Restore failed:', {
          error,
          userId,
        });
      }
      return { success: false, productId: null };
    }
  }

  checkPremiumStatusFromInfo(customerInfo: CustomerInfo): PremiumStatus {
    // First, check active entitlements (standard case)
    const activeEntitlement = getPremiumEntitlement(
      customerInfo,
      this.entitlementId
    );

    if (activeEntitlement) {
      const adjustedExpiration = getExpirationDate(activeEntitlement);
      return {
        isPremium: true,
        expirationDate: adjustedExpiration ? new Date(adjustedExpiration) : null,
      };
    }

    // Edge case: Check all entitlements (including expired ones)
    // This handles the bug where RevenueCat hasn't updated the expiration date yet
    const allEntitlements = customerInfo.entitlements.all[this.entitlementId];

    if (allEntitlements) {
      const entitlementData = {
        identifier: allEntitlements.identifier,
        productIdentifier: allEntitlements.productIdentifier,
        isSandbox: allEntitlements.isSandbox,
        willRenew: allEntitlements.willRenew,
        periodType: allEntitlements.periodType,
        latestPurchaseDate: allEntitlements.latestPurchaseDate,
        originalPurchaseDate: allEntitlements.originalPurchaseDate,
        expirationDate: allEntitlements.expirationDate,
        unsubscribeDetectedAt: allEntitlements.unsubscribeDetectedAt,
        billingIssueDetectedAt: allEntitlements.billingIssueDetectedAt,
      };

      // Get adjusted expiration date
      const adjustedExpiration = getExpirationDate(entitlementData);

      if (adjustedExpiration) {
        const expirationDate = new Date(adjustedExpiration);
        const now = new Date();

        // If adjusted expiration is in the future, user is premium
        if (expirationDate > now) {
          return {
            isPremium: true,
            expirationDate,
          };
        }
      }
    }

    return {
      isPremium: false,
      expirationDate: null,
    };
  }
}
