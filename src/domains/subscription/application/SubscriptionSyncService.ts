import type { CustomerInfo } from "react-native-purchases";
import type { RevenueCatData } from "../core/RevenueCatData";
import { type PeriodType, type PurchaseSource, PURCHASE_SOURCE, PURCHASE_TYPE } from "../core/SubscriptionConstants";
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

      await getCreditsRepository().initializeCredits(
        userId, 
        purchaseId, 
        productId, 
        source ?? PURCHASE_SOURCE.SETTINGS, // Default to settings if source unknown
        revenueCatData,
        PURCHASE_TYPE.INITIAL // Default to INITIAL
      );
      
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

      await getCreditsRepository().initializeCredits(
        userId, 
        purchaseId, 
        productId, 
        PURCHASE_SOURCE.RENEWAL, 
        revenueCatData,
        PURCHASE_TYPE.RENEWAL
      );
      
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

      // If productId is missing, we can't initialize credits fully, 
      // but if isPremium is true, we should have it.
      // Fallback to 'unknown' if missing, but this might throw in CreditLimitCalculator.
      const validProductId = productId ?? 'unknown_product';

      const revenueCatData: RevenueCatData = { 
        expirationDate: expiresAt ?? null, 
        willRenew: willRenew ?? false, 
        isPremium, 
        periodType: periodType ?? null, // Fix undefined vs null
        originalTransactionId: null // Initialize with null as we might not have it here
      };
      
      await getCreditsRepository().initializeCredits(
        userId, 
        `status_sync_${Date.now()}`, 
        validProductId, 
        PURCHASE_SOURCE.SETTINGS, 
        revenueCatData,
        PURCHASE_TYPE.INITIAL // Status sync treated as Initial or Update
      );
      
      subscriptionEventBus.emit(SUBSCRIPTION_EVENTS.CREDITS_UPDATED, userId);
      subscriptionEventBus.emit(SUBSCRIPTION_EVENTS.PREMIUM_STATUS_CHANGED, { userId, isPremium });
    } catch (error) {
      if (__DEV__) console.error('[SubscriptionSyncService] Premium status sync failed:', error);
    }
  }
}
