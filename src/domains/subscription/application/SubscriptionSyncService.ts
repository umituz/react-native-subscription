import type { CustomerInfo } from "react-native-purchases";
import type { RevenueCatData } from "../core/RevenueCatData";
import { type PeriodType, type PurchaseSource, PURCHASE_SOURCE, PURCHASE_TYPE } from "../core/SubscriptionConstants";
import { getCreditsRepository } from "../../credits/infrastructure/CreditsRepositoryManager";
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
      // Handle subscription expiration explicitly
      if (!isPremium && productId) {
        await getCreditsRepository().syncExpiredStatus(userId);
        subscriptionEventBus.emit(SUBSCRIPTION_EVENTS.CREDITS_UPDATED, userId);
        return;
      }

      // If not premium and no product, this is a freemium user.
      // We only want to run initializeCredits for them if it's their first time,
      // which initializeCredits handles, but we should avoid doing it on every sync.
      if (!isPremium && !productId) {
        // Option 1: Just skip if they are already known non-premium (handled by repository check)
        // For now, let's just use a more stable sync ID to allow the repository to skip if possible
        const stableSyncId = `init_sync_${userId}`;
        
        await getCreditsRepository().initializeCredits(
          userId, 
          stableSyncId, 
          'no_subscription', 
          PURCHASE_SOURCE.SETTINGS, 
          { 
            isPremium: false, 
            expirationDate: null, 
            willRenew: false, 
            periodType: null, 
            originalTransactionId: null 
          },
          PURCHASE_TYPE.INITIAL
        );
        
        subscriptionEventBus.emit(SUBSCRIPTION_EVENTS.CREDITS_UPDATED, userId);
        return;
      }

      // Standard status sync for premium users
      const revenueCatData: RevenueCatData = { 
        expirationDate: expiresAt ?? null, 
        willRenew: willRenew ?? false, 
        isPremium, 
        periodType: periodType ?? null,
        originalTransactionId: null 
      };
      
      await getCreditsRepository().initializeCredits(
        userId, 
        `status_sync_${Date.now()}`, 
        productId ?? 'no_subscription', 
        PURCHASE_SOURCE.SETTINGS, 
        revenueCatData,
        PURCHASE_TYPE.INITIAL
      );
      
      subscriptionEventBus.emit(SUBSCRIPTION_EVENTS.CREDITS_UPDATED, userId);
      subscriptionEventBus.emit(SUBSCRIPTION_EVENTS.PREMIUM_STATUS_CHANGED, { userId, isPremium });
    } catch (error) {
      if (__DEV__) console.error('[SubscriptionSyncService] Premium status sync failed:', error);
    }
  }
}
