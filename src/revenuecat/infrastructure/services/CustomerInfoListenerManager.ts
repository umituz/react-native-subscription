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

    this.listener = (customerInfo: CustomerInfo) => {
      if (!this.currentUserId) return;

      const hasPremium =
        !!customerInfo.entitlements.active[this.entitlementIdentifier];

      addPackageBreadcrumb("subscription", "Customer info updated", {
        userId: this.currentUserId,
        hasPremium,
        entitlementIdentifier: this.entitlementIdentifier,
      });

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
