import type { CustomerInfo } from "react-native-purchases";
import type { PeriodType, PurchaseSource } from "../core/SubscriptionConstants";
import { PURCHASE_SOURCE, PURCHASE_TYPE } from "../core/SubscriptionConstants";
import { getCreditsRepository } from "../../credits/infrastructure/CreditsRepositoryManager";
import { extractRevenueCatData } from "./SubscriptionSyncUtils";
import { emitCreditsUpdated } from "./syncEventEmitter";
import { generatePurchaseId, generateRenewalId } from "./syncIdGenerators";
import { handleExpiredSubscription, handleFreeUserInitialization, handlePremiumStatusSync } from "./statusChangeHandlers";
import { NO_SUBSCRIPTION_PRODUCT_ID } from "./syncConstants";

export class SubscriptionSyncProcessor {
  constructor(private entitlementId: string) {}

  async processPurchase(userId: string, productId: string, customerInfo: CustomerInfo, source?: PurchaseSource) {
    const revenueCatData = extractRevenueCatData(customerInfo, this.entitlementId);
    const purchaseId = generatePurchaseId(revenueCatData.originalTransactionId, productId);

    await getCreditsRepository().initializeCredits(
      userId,
      purchaseId,
      productId,
      source ?? PURCHASE_SOURCE.SETTINGS,
      revenueCatData,
      PURCHASE_TYPE.INITIAL
    );

    emitCreditsUpdated(userId);
  }

  async processRenewal(userId: string, productId: string, newExpirationDate: string, customerInfo: CustomerInfo) {
    const revenueCatData = extractRevenueCatData(customerInfo, this.entitlementId);
    revenueCatData.expirationDate = newExpirationDate || revenueCatData.expirationDate;
    const purchaseId = generateRenewalId(revenueCatData.originalTransactionId, productId, newExpirationDate);

    await getCreditsRepository().initializeCredits(
      userId,
      purchaseId,
      productId,
      PURCHASE_SOURCE.RENEWAL,
      revenueCatData,
      PURCHASE_TYPE.RENEWAL
    );

    emitCreditsUpdated(userId);
  }

  async processStatusChange(
    userId: string,
    isPremium: boolean,
    productId?: string,
    expiresAt?: string,
    willRenew?: boolean,
    periodType?: PeriodType
  ) {
    // Expired subscription case
    if (!isPremium && productId) {
      await handleExpiredSubscription(userId);
      return;
    }

    // Free user case
    if (!isPremium && !productId) {
      await handleFreeUserInitialization(userId);
      return;
    }

    // Premium user case
    await handlePremiumStatusSync(
      userId,
      isPremium,
      productId ?? NO_SUBSCRIPTION_PRODUCT_ID,
      expiresAt ?? null,
      willRenew ?? false,
      periodType ?? null
    );
  }
}
