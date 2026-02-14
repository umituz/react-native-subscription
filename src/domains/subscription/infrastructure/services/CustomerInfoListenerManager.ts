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

  setupListener(config: RevenueCatConfig): void {
    this.removeListener();

    this.state.listener = async (customerInfo: CustomerInfo) => {
      if (!this.state.currentUserId) return;

      this.state.renewalState = await processCustomerInfo(
        customerInfo,
        this.state.currentUserId,
        this.state.renewalState,
        config
      );
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
