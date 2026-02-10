import type { CustomerInfo } from "react-native-purchases";
import type { RevenueCatData } from "../core/RevenueCatData";
import { 
  type PeriodType, 
  type PurchaseSource, 
  PURCHASE_SOURCE, 
  PURCHASE_TYPE 
} from "../core/SubscriptionConstants";
import { getCreditsRepository } from "../../credits/infrastructure/CreditsRepositoryManager";
import { extractRevenueCatData } from "./SubscriptionSyncUtils";
import { subscriptionEventBus, SUBSCRIPTION_EVENTS } from "../../../shared/infrastructure/SubscriptionEventBus";

export class SubscriptionSyncProcessor {
  constructor(private entitlementId: string) {}

  async processPurchase(userId: string, productId: string, customerInfo: CustomerInfo, source?: PurchaseSource) {
    const revenueCatData = extractRevenueCatData(customerInfo, this.entitlementId);
    const purchaseId = revenueCatData.originalTransactionId
      ? `purchase_${revenueCatData.originalTransactionId}`
      : `purchase_${productId}_${Date.now()}`;

    await getCreditsRepository().initializeCredits(
      userId,
      purchaseId,
      productId,
      source ?? PURCHASE_SOURCE.SETTINGS,
      revenueCatData,
      PURCHASE_TYPE.INITIAL
    );

    subscriptionEventBus.emit(SUBSCRIPTION_EVENTS.CREDITS_UPDATED, userId);
  }

  async processRenewal(userId: string, productId: string, newExpirationDate: string, customerInfo: CustomerInfo) {
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
  }

  async processStatusChange(
    userId: string, 
    isPremium: boolean, 
    productId?: string,
    expiresAt?: string, 
    willRenew?: boolean, 
    periodType?: PeriodType
  ) {
    const repository = getCreditsRepository();
    
    if (!isPremium && !productId) {
      const currentCredits = await repository.getCredits(userId);
      if (currentCredits.success && currentCredits.data?.isPremium) {
        return;
      }
    }

    if (!isPremium && productId) {
      await repository.syncExpiredStatus(userId);
      subscriptionEventBus.emit(SUBSCRIPTION_EVENTS.CREDITS_UPDATED, userId);
      return;
    }

    if (!isPremium && !productId) {
      const stableSyncId = `init_sync_${userId}`;
      await repository.initializeCredits(
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

    const revenueCatData: RevenueCatData = { 
      expirationDate: expiresAt ?? null, 
      willRenew: willRenew ?? false, 
      isPremium, 
      periodType: periodType ?? null,
      originalTransactionId: null 
    };
    
    const statusSyncId = `status_sync_${userId}_${isPremium ? 'premium' : 'free'}`;
    await repository.initializeCredits(
      userId, 
      statusSyncId, 
      productId ?? 'no_subscription', 
      PURCHASE_SOURCE.SETTINGS, 
      revenueCatData,
      PURCHASE_TYPE.INITIAL
    );
    
    subscriptionEventBus.emit(SUBSCRIPTION_EVENTS.CREDITS_UPDATED, userId);
  }
}
