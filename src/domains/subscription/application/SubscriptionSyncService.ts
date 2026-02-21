import type { CustomerInfo } from "react-native-purchases";
import { type PeriodType, type PurchaseSource } from "../core/SubscriptionConstants";
import { subscriptionEventBus, SUBSCRIPTION_EVENTS } from "../../../shared/infrastructure/SubscriptionEventBus";
import { SubscriptionSyncProcessor } from "./SubscriptionSyncProcessor";
import type { PackageType } from "../../revenuecat/core/types";

export class SubscriptionSyncService {
  private processor: SubscriptionSyncProcessor;

  constructor(
    entitlementId: string,
    getAnonymousUserId: () => Promise<string>
  ) {
    this.processor = new SubscriptionSyncProcessor(entitlementId, getAnonymousUserId);
  }

  async handlePurchase(userId: string, productId: string, customerInfo: CustomerInfo, source?: PurchaseSource, packageType?: PackageType | null) {
    try {
      await this.processor.processPurchase(userId, productId, customerInfo, source, packageType);
      subscriptionEventBus.emit(SUBSCRIPTION_EVENTS.PURCHASE_COMPLETED, { userId, productId });
    } catch (error) {
      console.error('[SubscriptionSyncService] Purchase processing failed', {
        userId,
        productId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  async handleRenewal(userId: string, productId: string, newExpirationDate: string, customerInfo: CustomerInfo) {
    try {
      await this.processor.processRenewal(userId, productId, newExpirationDate, customerInfo);
      subscriptionEventBus.emit(SUBSCRIPTION_EVENTS.RENEWAL_DETECTED, { userId, productId });
    } catch (error) {
      console.error('[SubscriptionSyncService] Renewal processing failed', {
        userId,
        productId,
        newExpirationDate,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
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
    } catch (error) {
      console.error('[SubscriptionSyncService] Status change processing failed', {
        userId,
        isPremium,
        productId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }
}
