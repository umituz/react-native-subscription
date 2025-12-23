/**
 * Customer Info Listener Manager
 * Handles RevenueCat customer info update listeners
 */

import Purchases, {
  type CustomerInfo,
  type CustomerInfoUpdateListener,
} from "react-native-purchases";
import type { RevenueCatConfig } from "../../domain/value-objects/RevenueCatConfig";
import { syncPremiumStatus } from "../utils/PremiumStatusSyncer";
import { addPackageBreadcrumb } from "@umituz/react-native-sentry";

export class CustomerInfoListenerManager {
  private listener: CustomerInfoUpdateListener | null = null;
  private currentUserId: string | null = null;
  private entitlementIdentifier: string;

  constructor(entitlementIdentifier: string) {
    this.entitlementIdentifier = entitlementIdentifier;
  }

  setUserId(userId: string): void {
    this.currentUserId = userId;
  }

  clearUserId(): void {
    this.currentUserId = null;
  }

  setupListener(config: RevenueCatConfig): void {
    this.removeListener();

    addPackageBreadcrumb("subscription", "Setting up customer info listener", {
      userId: this.currentUserId,
    });

    this.listener = async (customerInfo: CustomerInfo) => {
      if (!this.currentUserId) return;

      const hasPremium =
        !!customerInfo.entitlements.active[this.entitlementIdentifier];

      addPackageBreadcrumb("subscription", "Customer info updated", {
        userId: this.currentUserId,
        hasPremium,
        entitlementIdentifier: this.entitlementIdentifier,
      });

      // Handle credit renewal for subscription renewals
      if (hasPremium && config.onCreditRenewal) {
        const premiumEntitlement =
          customerInfo.entitlements.active[this.entitlementIdentifier];

        if (premiumEntitlement && premiumEntitlement.expirationDate) {
          const productId = premiumEntitlement.productIdentifier;
          const renewalId = `renewal_${productId}_${premiumEntitlement.expirationDate}`;

          addPackageBreadcrumb(
            "subscription",
            "Processing credit renewal",
            {
              userId: this.currentUserId,
              productId,
              renewalId,
            }
          );

          try {
            await config.onCreditRenewal(
              this.currentUserId,
              productId,
              renewalId
            );

            addPackageBreadcrumb(
              "subscription",
              "Credit renewal completed",
              {
                userId: this.currentUserId,
                productId,
              }
            );
          } catch (error) {
            addPackageBreadcrumb(
              "subscription",
              "Credit renewal failed",
              {
                userId: this.currentUserId,
                productId,
                error: error instanceof Error ? error.message : String(error),
              }
            );
          }
        }
      }

      syncPremiumStatus(config, this.currentUserId, customerInfo);
    };

    Purchases.addCustomerInfoUpdateListener(this.listener);
  }

  removeListener(): void {
    if (this.listener) {
      addPackageBreadcrumb("subscription", "Removing customer info listener", {});
      Purchases.removeCustomerInfoUpdateListener(this.listener);
      this.listener = null;
    }
  }

  destroy(): void {
    this.removeListener();
    this.clearUserId();
  }
}
