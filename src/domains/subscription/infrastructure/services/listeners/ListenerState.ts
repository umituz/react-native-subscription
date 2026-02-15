import type { CustomerInfoUpdateListener } from "react-native-purchases";
import type { RenewalState } from "../../utils/renewal";

export class ListenerState {
  listener: CustomerInfoUpdateListener | null = null;
  currentUserId: string | null = null;
  renewalState: RenewalState = {
    previousExpirationDate: null,
    previousProductId: null,
  };

  reset(): void {
    this.listener = null;
    this.currentUserId = null;
    this.renewalState = {
      previousExpirationDate: null,
      previousProductId: null,
    };
  }

  resetRenewalState(): void {
    this.renewalState = {
      previousExpirationDate: null,
      previousProductId: null,
    };
  }

  hasUserChanged(newUserId: string): boolean {
    return !!(this.currentUserId && this.currentUserId !== newUserId);
  }
}
