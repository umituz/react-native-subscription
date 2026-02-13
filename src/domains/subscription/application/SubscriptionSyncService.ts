import type { CustomerInfo } from "react-native-purchases";
import { type PeriodType, type PurchaseSource } from "../core/SubscriptionConstants";
import { subscriptionEventBus, SUBSCRIPTION_EVENTS } from "../../../shared/infrastructure/SubscriptionEventBus";
import { SubscriptionSyncProcessor } from "./SubscriptionSyncProcessor";

export class SubscriptionSyncService {
  private processor: SubscriptionSyncProcessor;

  constructor(entitlementId: string) {
    this.processor = new SubscriptionSyncProcessor(entitlementId);
  }

  async handlePurchase(userId: string, productId: string, customerInfo: CustomerInfo, source?: PurchaseSource) {
    try {
      await this.processor.processPurchase(userId, productId, customerInfo, source);
      subscriptionEventBus.emit(SUBSCRIPTION_EVENTS.PURCHASE_COMPLETED, { userId, productId });
    } catch (_err) {
      // Swallow error - event bus consumers handle failures
    }
  }

  async handleRenewal(userId: string, productId: string, newExpirationDate: string, customerInfo: CustomerInfo) {
    try {
      await this.processor.processRenewal(userId, productId, newExpirationDate, customerInfo);
      subscriptionEventBus.emit(SUBSCRIPTION_EVENTS.RENEWAL_DETECTED, { userId, productId });
    } catch (_err) {
      // Swallow error - event bus consumers handle failures
    }
  }

  async handlePremiumStatusChanged(
    userId: string,
    isPremium: boolean,
    productId?: string,
    expiresAt?: string,
    willRenew?: boolean,
    periodType?: PeriodType
  ) {
    try {
      await this.processor.processStatusChange(userId, isPremium, productId, expiresAt, willRenew, periodType);
      subscriptionEventBus.emit(SUBSCRIPTION_EVENTS.PREMIUM_STATUS_CHANGED, { userId, isPremium });
    } catch (_err) {
      // Swallow error - event bus consumers handle failures
    }
  }
}

