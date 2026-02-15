import type { CustomerInfo } from "react-native-purchases";
import type { PeriodType, PurchaseSource } from "../core/SubscriptionConstants";
import { PURCHASE_SOURCE, PURCHASE_TYPE } from "../core/SubscriptionConstants";
import { getCreditsRepository } from "../../credits/infrastructure/CreditsRepositoryManager";
import { extractRevenueCatData } from "./SubscriptionSyncUtils";
import { emitCreditsUpdated } from "./syncEventEmitter";
import { generatePurchaseId, generateRenewalId } from "./syncIdGenerators";
import { handleExpiredSubscription, handleFreeUserInitialization, handlePremiumStatusSync } from "./statusChangeHandlers";
import { NO_SUBSCRIPTION_PRODUCT_ID } from "./syncConstants";
import type { PackageType } from "../../revenuecat/core/types";

export class SubscriptionSyncProcessor {
  constructor(
    private entitlementId: string,
    private getAnonymousUserId: () => Promise<string>
  ) {}

  private async getCreditsUserId(revenueCatUserId: string): Promise<string> {
    if (!revenueCatUserId || revenueCatUserId.length === 0) {
      return this.getAnonymousUserId();
    }
    return revenueCatUserId;
  }

  async processPurchase(userId: string, productId: string, customerInfo: CustomerInfo, source?: PurchaseSource, packageType?: PackageType | null) {
    const revenueCatData = extractRevenueCatData(customerInfo, this.entitlementId);
    revenueCatData.packageType = packageType ?? null;
    const purchaseId = generatePurchaseId(revenueCatData.originalTransactionId, productId);

    const creditsUserId = await this.getCreditsUserId(userId);

    await getCreditsRepository().initializeCredits(
      creditsUserId,
      purchaseId,
      productId,
      source ?? PURCHASE_SOURCE.SETTINGS,
      revenueCatData,
      PURCHASE_TYPE.INITIAL
    );

    emitCreditsUpdated(creditsUserId);
  }

  async processRenewal(userId: string, productId: string, newExpirationDate: string, customerInfo: CustomerInfo) {
    const revenueCatData = extractRevenueCatData(customerInfo, this.entitlementId);
    revenueCatData.expirationDate = newExpirationDate || revenueCatData.expirationDate;
    const purchaseId = generateRenewalId(revenueCatData.originalTransactionId, productId, newExpirationDate);

    const creditsUserId = await this.getCreditsUserId(userId);

    await getCreditsRepository().initializeCredits(
      creditsUserId,
      purchaseId,
      productId,
      PURCHASE_SOURCE.RENEWAL,
      revenueCatData,
      PURCHASE_TYPE.RENEWAL
    );

    emitCreditsUpdated(creditsUserId);
  }

  async processStatusChange(
    userId: string,
    isPremium: boolean,
    productId?: string,
    expiresAt?: string,
    willRenew?: boolean,
    periodType?: PeriodType
  ) {
    const creditsUserId = await this.getCreditsUserId(userId);

    // Expired subscription case
    if (!isPremium && productId) {
      await handleExpiredSubscription(creditsUserId);
      return;
    }

    // Free user case
    if (!isPremium && !productId) {
      await handleFreeUserInitialization(creditsUserId);
      return;
    }

    // Premium user case
    await handlePremiumStatusSync(
      creditsUserId,
      isPremium,
      productId ?? NO_SUBSCRIPTION_PRODUCT_ID,
      expiresAt ?? null,
      willRenew ?? false,
      periodType ?? null
    );
  }
}
