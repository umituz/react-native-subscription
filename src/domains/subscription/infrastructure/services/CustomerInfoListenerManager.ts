import Purchases, { type CustomerInfo } from "react-native-purchases";
import type { RevenueCatConfig } from "../../../revenuecat/core/types";
import { ListenerState } from "./listeners/ListenerState";
import { processCustomerInfo } from "./listeners/CustomerInfoHandler";

export class CustomerInfoListenerManager {
  private state = new ListenerState();

  setUserId(userId: string, config: RevenueCatConfig): void {
    const wasUserChange = this.state.hasUserChanged(userId);

    if (wasUserChange) {
      this.removeListener();
      this.state.resetRenewalState();
    }

    this.state.currentUserId = userId;

    if (wasUserChange || !this.state.listener) {
      this.setupListener(config);
    }
  }

  clearUserId(): void {
    this.state.currentUserId = null;
    this.state.resetRenewalState();
  }

  setupListener(config: RevenueCatConfig): boolean {
    this.removeListener();

    try {
      this._createAndAttachListener(config);
      return true;
    } catch (error) {
      console.error("[CustomerInfoListenerManager] Failed to setup listener:", error);
      this.state.currentUserId = null;
      return false;
    }
  }

  private _createAndAttachListener(config: RevenueCatConfig): void {
    this.state.listener = async (customerInfo: CustomerInfo) => {
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log("[CustomerInfoListener] 🔔 LISTENER TRIGGERED!", {
          userId: this.state.currentUserId,
          activeEntitlements: Object.keys(customerInfo.entitlements.active),
          entitlementsCount: Object.keys(customerInfo.entitlements.all).length,
        });
      }

      const capturedUserId = this.state.currentUserId;
      if (!capturedUserId) {
        return;
      }

      try {
        const newRenewalState = await processCustomerInfo(
          customerInfo,
          capturedUserId,
          this.state.renewalState,
          config
        );

        if (this.state.currentUserId === capturedUserId) {
          this.state.renewalState = newRenewalState;
        }
        // else: User switched during async operation, discard stale renewal state
      } catch (error) {
        console.error("[CustomerInfoListener] processCustomerInfo failed:", error);
      }
    };

    Purchases.addCustomerInfoUpdateListener(this.state.listener);
  }

  removeListener(): void {
    if (this.state.listener) {
      Purchases.removeCustomerInfoUpdateListener(this.state.listener);
      this.state.listener = null;
    }
  }

  destroy(): void {
    this.removeListener();
    this.state.reset();
  }
}
