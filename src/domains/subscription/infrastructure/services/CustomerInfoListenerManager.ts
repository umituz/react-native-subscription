import Purchases, { type CustomerInfo } from "react-native-purchases";
import type { RevenueCatConfig } from "../../../revenuecat/core/types";
import { ListenerState } from "./listeners/ListenerState";
import { processCustomerInfo } from "./listeners/CustomerInfoHandler";

declare const __DEV__: boolean;

export class CustomerInfoListenerManager {
  private state = new ListenerState();

  setUserId(userId: string, config: RevenueCatConfig): void {
    const wasUserChange = this.state.hasUserChanged(userId);

    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.log("[CustomerInfoListener] setUserId called:", {
        userId,
        wasUserChange,
        hasListener: !!this.state.listener,
      });
    }

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
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.log("[CustomerInfoListener] clearUserId called");
    }
    this.state.currentUserId = null;
    this.state.resetRenewalState();
  }

  setupListener(config: RevenueCatConfig): void {
    this.removeListener();

    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.log("[CustomerInfoListener] setupListener: Registering listener");
    }

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
        if (typeof __DEV__ !== "undefined" && __DEV__) {
          console.log("[CustomerInfoListener] No userId - skipping");
        }
        return;
      }

      const newRenewalState = await processCustomerInfo(
        customerInfo,
        capturedUserId,
        this.state.renewalState,
        config
      );

      if (this.state.currentUserId === capturedUserId) {
        this.state.renewalState = newRenewalState;
        if (typeof __DEV__ !== "undefined" && __DEV__) {
          console.log("[CustomerInfoListener] processCustomerInfo completed");
        }
      } else {
        if (typeof __DEV__ !== "undefined" && __DEV__) {
          console.log("[CustomerInfoListener] User changed during processing - discarding result");
        }
      }
    };

    Purchases.addCustomerInfoUpdateListener(this.state.listener);

    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.log("[CustomerInfoListener] Listener registered successfully");
    }
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
