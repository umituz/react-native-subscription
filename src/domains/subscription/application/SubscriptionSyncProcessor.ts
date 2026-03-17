import { PURCHASE_SOURCE, PURCHASE_TYPE } from "../core/SubscriptionConstants";
import type { PremiumStatusChangedEvent, PurchaseCompletedEvent, RenewalDetectedEvent } from "../core/SubscriptionEvents";
import { getCreditsRepository } from "../../credits/infrastructure/CreditsRepositoryManager";
import { extractRevenueCatData } from "./SubscriptionSyncUtils";
import { generatePurchaseId, generateRenewalId } from "./syncIdGenerators";
import { subscriptionEventBus, SUBSCRIPTION_EVENTS } from "../../../shared/infrastructure/SubscriptionEventBus";
import { useSubscriptionFlowStore, SyncStatus } from "../presentation/useSubscriptionFlow";

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
    const store = useSubscriptionFlowStore.getState();
    store.setSyncStatus(SyncStatus.SYNCING);
    
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.log('[SubscriptionSyncProcessor] 🔵 PURCHASE START', {
        userId: event.userId,
        productId: event.productId,
        source: event.source,
        packageType: event.packageType,
        timestamp: new Date().toISOString(),
      });
    }
    try {
      await this.processPurchase(event);
      subscriptionEventBus.emit(SUBSCRIPTION_EVENTS.PURCHASE_COMPLETED, {
        userId: event.userId,
        productId: event.productId,
      });
      store.setSyncStatus(SyncStatus.SUCCESS);
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log('[SubscriptionSyncProcessor] 🟢 PURCHASE SUCCESS', {
          userId: event.userId,
          productId: event.productId,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      store.setSyncStatus(SyncStatus.ERROR, errorMsg);
      console.error('[SubscriptionSyncProcessor] 🔴 PURCHASE FAILED', {
        userId: event.userId,
        productId: event.productId,
        error: errorMsg,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  async handleRenewal(event: RenewalDetectedEvent): Promise<void> {
    const store = useSubscriptionFlowStore.getState();
    store.setSyncStatus(SyncStatus.SYNCING);

    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.log('[SubscriptionSyncProcessor] 🔵 RENEWAL START', {
        userId: event.userId,
        productId: event.productId,
        newExpirationDate: event.newExpirationDate,
        timestamp: new Date().toISOString(),
      });
    }
    try {
      await this.processRenewal(event);
      subscriptionEventBus.emit(SUBSCRIPTION_EVENTS.RENEWAL_DETECTED, {
        userId: event.userId,
        productId: event.productId,
      });
      store.setSyncStatus(SyncStatus.SUCCESS);
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log('[SubscriptionSyncProcessor] 🟢 RENEWAL SUCCESS', {
          userId: event.userId,
          productId: event.productId,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      store.setSyncStatus(SyncStatus.ERROR, errorMsg);
      console.error('[SubscriptionSyncProcessor] 🔴 RENEWAL FAILED', {
        userId: event.userId,
        productId: event.productId,
        error: errorMsg,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  async handlePremiumStatusChanged(event: PremiumStatusChangedEvent): Promise<void> {
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.log('[SubscriptionSyncProcessor] 🔵 STATUS CHANGE START', {
        userId: event.userId,
        isPremium: event.isPremium,
        productId: event.productId,
        willRenew: event.willRenew,
        expirationDate: event.expirationDate,
        timestamp: new Date().toISOString(),
      });
    }
    try {
      await this.processStatusChange(event);
      subscriptionEventBus.emit(SUBSCRIPTION_EVENTS.PREMIUM_STATUS_CHANGED, {
        userId: event.userId,
        isPremium: event.isPremium,
      });
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log('[SubscriptionSyncProcessor] 🟢 STATUS CHANGE SUCCESS', {
          userId: event.userId,
          isPremium: event.isPremium,
          productId: event.productId,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('[SubscriptionSyncProcessor] 🔴 STATUS CHANGE FAILED', {
        userId: event.userId,
        isPremium: event.isPremium,
        productId: event.productId,
        error: errorMsg,
        timestamp: new Date().toISOString(),
      });
      // We don't set global sync error here for passive status changes to avoid UI noise
      // throw error; 
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
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.log('[SubscriptionSyncProcessor] 🔵 processPurchase: Starting credit initialization', {
        productId: event.productId,
        source: event.source,
        packageType: event.packageType,
        activeEntitlements: Object.keys(event.customerInfo.entitlements.active),
      });
    }
    try {
      const revenueCatData = extractRevenueCatData(event.customerInfo, this.entitlementId);
      revenueCatData.packageType = event.packageType ?? null;
      // Use the event.userId instead of polling the SDK to avoid race conditions during rapid user switching
      revenueCatData.revenueCatUserId = event.userId;
      const purchaseId = generatePurchaseId(revenueCatData.storeTransactionId, event.productId);

      const creditsUserId = await this.getCreditsUserId(event.userId);

      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log('[SubscriptionSyncProcessor] 🔵 processPurchase: Calling initializeCredits', {
          creditsUserId,
          purchaseId,
          productId: event.productId,
          revenueCatUserId: revenueCatData.revenueCatUserId,
        });
      }

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
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log('[SubscriptionSyncProcessor] 🟢 processPurchase: Credits initialized successfully', {
          creditsUserId,
          purchaseId,
          credits: result.data?.credits,
        });
      }
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

    if (__DEV__) {
      console.log('[SubscriptionSyncProcessor] 🔵 syncPremiumStatus: Starting', {
        userId,
        isPremium: event.isPremium,
        productId: event.productId,
        willRenew: event.willRenew,
      });
    }

    if (event.isPremium) {
      const created = await repo.ensurePremiumCreditsExist(
        userId,
        event.productId!,
        event.willRenew ?? false,
        event.expirationDate ?? null,
        event.periodType ?? null,
      );
      if (__DEV__ && created) {
        console.log('[SubscriptionSyncProcessor] 🟢 Recovery: created missing credits document for premium user', {
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

    if (__DEV__) {
      console.log('[SubscriptionSyncProcessor] 🟢 syncPremiumStatus: Completed', {
        userId,
        isPremium: event.isPremium,
        productId: event.productId,
      });
    }
  }

  private emitCreditsUpdated(userId: string): void {
    subscriptionEventBus.emit(SUBSCRIPTION_EVENTS.CREDITS_UPDATED, userId);
  }
}
