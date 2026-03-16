import { PURCHASE_SOURCE, PURCHASE_TYPE } from "../core/SubscriptionConstants";
import type { PremiumStatusChangedEvent, PurchaseCompletedEvent, RenewalDetectedEvent } from "../core/SubscriptionEvents";
import { getCreditsRepository } from "../../credits/infrastructure/CreditsRepositoryManager";
import { extractRevenueCatData } from "./SubscriptionSyncUtils";
import { generatePurchaseId, generateRenewalId } from "./syncIdGenerators";
import { subscriptionEventBus, SUBSCRIPTION_EVENTS } from "../../../shared/infrastructure/SubscriptionEventBus";

/**
 * Central processor for all subscription sync operations.
 * Handles purchases, renewals, and status changes with credit allocation.
 *
 * Responsibilities:
 * - Purchase: allocate initial credits via atomic Firestore transaction
 * - Renewal: allocate renewal credits
 * - Status change: sync metadata (no credit allocation) or mark expired
 * - Recovery: create missing credits document for premium users
 */
export class SubscriptionSyncProcessor {
  private purchaseInProgress = false;

  constructor(
    private entitlementId: string,
    private getAnonymousUserId: () => Promise<string>
  ) {}

  // ─── Public API (replaces SubscriptionSyncService) ────────────────

  async handlePurchase(event: PurchaseCompletedEvent): Promise<void> {
    try {
      await this.processPurchase(event);
      subscriptionEventBus.emit(SUBSCRIPTION_EVENTS.PURCHASE_COMPLETED, {
        userId: event.userId,
        productId: event.productId,
      });
    } catch (error) {
      console.error('[SubscriptionSyncProcessor] Purchase processing failed', {
        userId: event.userId,
        productId: event.productId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async handleRenewal(event: RenewalDetectedEvent): Promise<void> {
    try {
      await this.processRenewal(event);
      subscriptionEventBus.emit(SUBSCRIPTION_EVENTS.RENEWAL_DETECTED, {
        userId: event.userId,
        productId: event.productId,
      });
    } catch (error) {
      console.error('[SubscriptionSyncProcessor] Renewal processing failed', {
        userId: event.userId,
        productId: event.productId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async handlePremiumStatusChanged(event: PremiumStatusChangedEvent): Promise<void> {
    try {
      await this.processStatusChange(event);
      subscriptionEventBus.emit(SUBSCRIPTION_EVENTS.PREMIUM_STATUS_CHANGED, {
        userId: event.userId,
        isPremium: event.isPremium,
      });
    } catch (error) {
      console.error('[SubscriptionSyncProcessor] Status change processing failed', {
        userId: event.userId,
        isPremium: event.isPremium,
        productId: event.productId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  // ─── Internal Processing ──────────────────────────────────────────

  private async getCreditsUserId(revenueCatUserId: string | null | undefined): Promise<string> {
    const trimmed = revenueCatUserId?.trim();
    if (trimmed && trimmed.length > 0 && trimmed !== 'undefined' && trimmed !== 'null') {
      return trimmed;
    }

    console.warn("[SubscriptionSyncProcessor] revenueCatUserId is empty/null, falling back to anonymousUserId");
    const anonymousId = await this.getAnonymousUserId();
    const trimmedAnonymous = anonymousId?.trim();
    if (!trimmedAnonymous || trimmedAnonymous.length === 0 || trimmedAnonymous === 'undefined' || trimmedAnonymous === 'null') {
      throw new Error("[SubscriptionSyncProcessor] Cannot resolve credits userId: both revenueCatUserId and anonymousUserId are empty");
    }
    return trimmedAnonymous;
  }

  private async processPurchase(event: PurchaseCompletedEvent): Promise<void> {
    this.purchaseInProgress = true;
    try {
      const revenueCatData = extractRevenueCatData(event.customerInfo, this.entitlementId);
      revenueCatData.packageType = event.packageType ?? null;
      // Use the event.userId instead of polling the SDK to avoid race conditions during rapid user switching
      revenueCatData.revenueCatUserId = event.userId;
      const purchaseId = generatePurchaseId(revenueCatData.storeTransactionId, event.productId);

      const creditsUserId = await this.getCreditsUserId(event.userId);

      const result = await getCreditsRepository().initializeCredits(
        creditsUserId,
        purchaseId,
        event.productId,
        event.source ?? PURCHASE_SOURCE.SETTINGS,
        revenueCatData,
        PURCHASE_TYPE.INITIAL
      );

      if (!result.success) {
        throw new Error(`[SubscriptionSyncProcessor] Credit initialization failed for purchase: ${result.error?.message ?? 'unknown'}`);
      }

      this.emitCreditsUpdated(creditsUserId);
    } finally {
      this.purchaseInProgress = false;
    }
  }

  private async processRenewal(event: RenewalDetectedEvent): Promise<void> {
    this.purchaseInProgress = true;
    try {
      const revenueCatData = extractRevenueCatData(event.customerInfo, this.entitlementId);
      revenueCatData.expirationDate = event.newExpirationDate ?? revenueCatData.expirationDate;
      // Use the event.userId instead of polling the SDK to avoid race conditions during rapid user switching
      revenueCatData.revenueCatUserId = event.userId;
      const purchaseId = generateRenewalId(revenueCatData.storeTransactionId, event.productId, event.newExpirationDate);

      const creditsUserId = await this.getCreditsUserId(event.userId);

      const result = await getCreditsRepository().initializeCredits(
        creditsUserId,
        purchaseId,
        event.productId,
        PURCHASE_SOURCE.RENEWAL,
        revenueCatData,
        PURCHASE_TYPE.RENEWAL
      );

      if (!result.success) {
        throw new Error(`[SubscriptionSyncProcessor] Credit initialization failed for renewal: ${result.error?.message ?? 'unknown'}`);
      }

      this.emitCreditsUpdated(creditsUserId);
    } finally {
      this.purchaseInProgress = false;
    }
  }

  private async processStatusChange(event: PremiumStatusChangedEvent): Promise<void> {
    if (this.purchaseInProgress) {
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log("[SubscriptionSyncProcessor] Purchase in progress - running recovery only");
      }
      if (event.isPremium && event.productId) {
        const creditsUserId = await this.getCreditsUserId(event.userId);
        await this.syncPremiumStatus(creditsUserId, event);
      }
      return;
    }

    const creditsUserId = await this.getCreditsUserId(event.userId);

    if (!event.isPremium && event.productId) {
      await this.expireSubscription(creditsUserId);
      return;
    }

    if (!event.isPremium && !event.productId) {
      const hasDoc = await getCreditsRepository().creditsDocumentExists(creditsUserId);
      if (hasDoc) {
        await this.expireSubscription(creditsUserId);
      }
      return;
    }

    if (!event.productId) {
      return;
    }

    await this.syncPremiumStatus(creditsUserId, event);
  }

  // ─── Credit Document Operations ───

  private async expireSubscription(userId: string): Promise<void> {
    await getCreditsRepository().syncExpiredStatus(userId);
    this.emitCreditsUpdated(userId);
  }

  private async syncPremiumStatus(userId: string, event: PremiumStatusChangedEvent): Promise<void> {
    const repo = getCreditsRepository();

    if (event.isPremium) {
      const created = await repo.ensurePremiumCreditsExist(
        userId,
        event.productId!,
        event.willRenew ?? false,
        event.expirationDate ?? null,
        event.periodType ?? null,
        event.storeTransactionId,
      );
      if (__DEV__ && created) {
        console.log('[SubscriptionSyncProcessor] Recovery: created missing credits document for premium user', {
          userId,
          productId: event.productId,
        });
      }
    }

    await repo.syncPremiumMetadata(userId, {
      isPremium: event.isPremium,
      willRenew: event.willRenew ?? false,
      expirationDate: event.expirationDate ?? null,
      productId: event.productId!,
      periodType: event.periodType ?? null,
      unsubscribeDetectedAt: event.unsubscribeDetectedAt ?? null,
      billingIssueDetectedAt: event.billingIssueDetectedAt ?? null,
      store: event.store ?? null,
      ownershipType: event.ownershipType ?? null,
    });
    this.emitCreditsUpdated(userId);
  }

  private emitCreditsUpdated(userId: string): void {
    subscriptionEventBus.emit(SUBSCRIPTION_EVENTS.CREDITS_UPDATED, userId);
  }
}
