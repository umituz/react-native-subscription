import type { CustomerInfo } from "react-native-purchases";
import type { RevenueCatData } from "../core/RevenueCatData";
import { type PeriodType, type PurchaseSource } from "../core/SubscriptionConstants";
import { getCreditsRepository } from "../../credits/infrastructure/CreditsRepositoryProvider";
import { extractRevenueCatData } from "./SubscriptionSyncUtils";
import { subscriptionEventBus, SUBSCRIPTION_EVENTS } from "../../../shared/infrastructure/SubscriptionEventBus";

/**
 * Service to synchronize RevenueCat state with Firestore.
 * Acts as a subscriber/handler for subscription events.
 */
export class SubscriptionSyncService {
  constructor(private entitlementId: string) {}

  async handlePurchase(userId: string, productId: string, customerInfo: CustomerInfo, source?: PurchaseSource) {
    try {
      const revenueCatData = extractRevenueCatData(customerInfo, this.entitlementId);
      const purchaseId = revenueCatData.originalTransactionId 
        ? `purchase_${revenueCatData.originalTransactionId}`
        : `purchase_${productId}_${Date.now()}`;

      await getCreditsRepository().initializeCredits(userId, purchaseId, productId, source, revenueCatData);
      
      // Notify listeners via Event Bus
      subscriptionEventBus.emit(SUBSCRIPTION_EVENTS.CREDITS_UPDATED, userId);
      subscriptionEventBus.emit(SUBSCRIPTION_EVENTS.PURCHASE_COMPLETED, { userId, productId });
    } catch (error) {
      if (__DEV__) console.error('[SubscriptionSyncService] Credits init failed:', error);
    }
  }

  async handleRenewal(userId: string, productId: string, newExpirationDate: string, customerInfo: CustomerInfo) {
    try {
      const revenueCatData = extractRevenueCatData(customerInfo, this.entitlementId);
      revenueCatData.expirationDate = newExpirationDate || revenueCatData.expirationDate;
      const purchaseId = revenueCatData.originalTransactionId 
        ? `renewal_${revenueCatData.originalTransactionId}_${newExpirationDate}`
        : `renewal_${productId}_${Date.now()}`;

      await getCreditsRepository().initializeCredits(userId, purchaseId, productId, "renewal", revenueCatData);
      
      subscriptionEventBus.emit(SUBSCRIPTION_EVENTS.CREDITS_UPDATED, userId);
      subscriptionEventBus.emit(SUBSCRIPTION_EVENTS.RENEWAL_DETECTED, { userId, productId });
    } catch (error) {
      if (__DEV__) console.error('[SubscriptionSyncService] Renewal credits init failed:', error);
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
      if (!isPremium && productId) {
        await getCreditsRepository().syncExpiredStatus(userId);
        subscriptionEventBus.emit(SUBSCRIPTION_EVENTS.CREDITS_UPDATED, userId);
        return;
      }

      const revenueCatData: RevenueCatData = { 
        expirationDate: expiresAt ?? null, 
        willRenew: willRenew ?? false, 
        isPremium, 
        periodType 
      };
      
      await getCreditsRepository().initializeCredits(userId, `status_sync_${Date.now()}`, productId, "settings", revenueCatData);
      
      subscriptionEventBus.emit(SUBSCRIPTION_EVENTS.CREDITS_UPDATED, userId);
      subscriptionEventBus.emit(SUBSCRIPTION_EVENTS.PREMIUM_STATUS_CHANGED, { userId, isPremium });
    } catch (error) {
      if (__DEV__) console.error('[SubscriptionSyncService] Premium status sync failed:', error);
    }
  }
}
