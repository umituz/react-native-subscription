import type { CustomerInfo } from "react-native-purchases";
import Purchases from "react-native-purchases";
import type { PeriodType, PurchaseSource } from "../core/SubscriptionConstants";
import { PURCHASE_SOURCE, PURCHASE_TYPE } from "../core/SubscriptionConstants";
import { getCreditsRepository } from "../../credits/infrastructure/CreditsRepositoryManager";
import { extractRevenueCatData } from "./SubscriptionSyncUtils";
import { emitCreditsUpdated } from "./syncEventEmitter";
import { generatePurchaseId, generateRenewalId } from "./syncIdGenerators";
import { handleExpiredSubscription, handlePremiumStatusSync } from "./statusChangeHandlers";
import type { PackageType } from "../../revenuecat/core/types";

export class SubscriptionSyncProcessor {
  private purchaseInProgress = false;

  constructor(
    private entitlementId: string,
    private getAnonymousUserId: () => Promise<string>
  ) {}

  private async getRevenueCatAppUserId(): Promise<string | null> {
    try {
      return await Purchases.getAppUserID();
    } catch {
      return null;
    }
  }

  private async getCreditsUserId(revenueCatUserId: string | null | undefined): Promise<string> {
    const trimmed = revenueCatUserId?.trim();
    if (trimmed && trimmed.length > 0) {
      return trimmed;
    }

    console.warn("[SubscriptionSyncProcessor] revenueCatUserId is empty/null, falling back to anonymousUserId");
    const anonymousId = await this.getAnonymousUserId();
    const trimmedAnonymous = anonymousId?.trim();
    if (!trimmedAnonymous || trimmedAnonymous.length === 0) {
      throw new Error("[SubscriptionSyncProcessor] Cannot resolve credits userId: both revenueCatUserId and anonymousUserId are empty");
    }
    return trimmedAnonymous;
  }

  async processPurchase(userId: string, productId: string, customerInfo: CustomerInfo, source?: PurchaseSource, packageType?: PackageType | null) {
    this.purchaseInProgress = true;
    try {
      const revenueCatData = extractRevenueCatData(customerInfo, this.entitlementId);
      revenueCatData.packageType = packageType ?? null;
      const revenueCatAppUserId = await this.getRevenueCatAppUserId();
      revenueCatData.revenueCatUserId = revenueCatAppUserId ?? userId;
      const purchaseId = generatePurchaseId(revenueCatData.originalTransactionId, productId);

      const creditsUserId = await this.getCreditsUserId(userId);

      const result = await getCreditsRepository().initializeCredits(
        creditsUserId,
        purchaseId,
        productId,
        source ?? PURCHASE_SOURCE.SETTINGS,
        revenueCatData,
        PURCHASE_TYPE.INITIAL
      );

      if (!result.success) {
        throw new Error(`[SubscriptionSyncProcessor] Credit initialization failed for purchase: ${result.error?.message ?? 'unknown'}`);
      }

      emitCreditsUpdated(creditsUserId);
    } finally {
      this.purchaseInProgress = false;
    }
  }

  async processRenewal(userId: string, productId: string, newExpirationDate: string, customerInfo: CustomerInfo) {
    this.purchaseInProgress = true;
    try {
      const revenueCatData = extractRevenueCatData(customerInfo, this.entitlementId);
      revenueCatData.expirationDate = newExpirationDate ?? revenueCatData.expirationDate;
      const revenueCatAppUserId = await this.getRevenueCatAppUserId();
      revenueCatData.revenueCatUserId = revenueCatAppUserId ?? userId;
      const purchaseId = generateRenewalId(revenueCatData.originalTransactionId, productId, newExpirationDate);

      const creditsUserId = await this.getCreditsUserId(userId);

      const result = await getCreditsRepository().initializeCredits(
        creditsUserId,
        purchaseId,
        productId,
        PURCHASE_SOURCE.RENEWAL,
        revenueCatData,
        PURCHASE_TYPE.RENEWAL
      );

      if (!result.success) {
        throw new Error(`[SubscriptionSyncProcessor] Credit initialization failed for renewal: ${result.error?.message ?? 'unknown'}`);
      }

      emitCreditsUpdated(creditsUserId);
    } finally {
      this.purchaseInProgress = false;
    }
  }

  async processStatusChange(
    userId: string,
    isPremium: boolean,
    productId?: string,
    expiresAt?: string,
    willRenew?: boolean,
    periodType?: PeriodType
  ) {
    // If a purchase is in progress, skip metadata sync (purchase handler does it)
    // but still allow recovery to run — the purchase handler's credit initialization
    // might have failed, and this is the safety net.
    if (this.purchaseInProgress) {
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log("[SubscriptionSyncProcessor] Purchase in progress - running recovery only");
      }
      if (isPremium && productId) {
        const creditsUserId = await this.getCreditsUserId(userId);
        await handlePremiumStatusSync(
          creditsUserId,
          isPremium,
          productId,
          expiresAt ?? null,
          willRenew ?? false,
          periodType ?? null
        );
      }
      return;
    }

    const creditsUserId = await this.getCreditsUserId(userId);

    if (!isPremium && productId) {
      await handleExpiredSubscription(creditsUserId);
      return;
    }

    if (!isPremium && !productId) {
      // Cancellation: RevenueCat removed entitlement, no productId available.
      // Must still update Firestore to reflect expired/canceled status.
      await handleExpiredSubscription(creditsUserId);
      return;
    }

    if (!productId) {
      return;
    }

    await handlePremiumStatusSync(
      creditsUserId,
      isPremium,
      productId,
      expiresAt ?? null,
      willRenew ?? false,
      periodType ?? null
    );
  }
}
