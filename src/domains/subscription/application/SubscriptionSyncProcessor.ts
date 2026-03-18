/**
 * Subscription Sync Processor (Refactored)
 *
 * Facade for subscription sync operations.
 * Delegates to specialized handlers for better maintainability.
 *
 * Architecture:
 * - SyncProcessorLogger: Centralized logging
 * - UserIdResolver: User ID resolution
 * - PurchaseSyncHandler: Purchase processing
 * - RenewalSyncHandler: Renewal processing
 * - StatusChangeSyncHandler: Status change processing
 * - CreditDocumentOperations: Credit doc operations
 */

import { subscriptionEventBus, SUBSCRIPTION_EVENTS } from "../../../shared/infrastructure/SubscriptionEventBus";
import type { PurchaseCompletedEvent, RenewalDetectedEvent, PremiumStatusChangedEvent } from "../core/SubscriptionEvents";
import { SyncProcessorLogger } from "./sync/SyncProcessorLogger";
import { UserIdResolver } from "./sync/UserIdResolver";
import { PurchaseSyncHandler } from "./sync/PurchaseSyncHandler";
import { RenewalSyncHandler } from "./sync/RenewalSyncHandler";
import { StatusChangeSyncHandler } from "./sync/StatusChangeSyncHandler";
import { CreditDocumentOperations } from "./sync/CreditDocumentOperations";

export class SubscriptionSyncProcessor {
  private logger: SyncProcessorLogger;
  private userIdResolver: UserIdResolver;
  private purchaseHandler: PurchaseSyncHandler;
  private renewalHandler: RenewalSyncHandler;
  private statusChangeHandler: StatusChangeSyncHandler;
  private creditOps: CreditDocumentOperations;

  constructor(
    entitlementId: string,
    getAnonymousUserId: () => Promise<string>
  ) {
    // Initialize dependencies
    this.logger = new SyncProcessorLogger();
    this.userIdResolver = new UserIdResolver(getAnonymousUserId);
    this.creditOps = new CreditDocumentOperations();
    this.purchaseHandler = new PurchaseSyncHandler(entitlementId, this.userIdResolver);
    this.renewalHandler = new RenewalSyncHandler(entitlementId, this.userIdResolver);
    this.statusChangeHandler = new StatusChangeSyncHandler(
      this.userIdResolver,
      this.creditOps,
      this.purchaseHandler
    );
  }

  // ─────────────────────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────────────────────

  async handlePurchase(event: PurchaseCompletedEvent): Promise<{ success: boolean; error?: string }> {
    this.logger.emitSyncStatus('purchase', 'syncing', {
      userId: event.userId,
      productId: event.productId,
    });

    this.logger.logPurchaseStart(event);

    try {
      await this.purchaseHandler.processPurchase(event);

      subscriptionEventBus.emit(SUBSCRIPTION_EVENTS.PURCHASE_COMPLETED, {
        userId: event.userId,
        productId: event.productId,
      });

      this.logger.emitSyncStatus('purchase', 'success', {
        userId: event.userId,
        productId: event.productId,
      });

      this.logger.logPurchaseSuccess(event.userId, event.productId);

      return { success: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);

      this.logger.emitSyncStatus('purchase', 'error', {
        userId: event.userId,
        productId: event.productId,
        error: errorMsg,
      });

      this.logger.logPurchaseError(event.userId, event.productId, errorMsg);

      return { success: false, error: errorMsg };
    }
  }

  async handleRenewal(event: RenewalDetectedEvent): Promise<{ success: boolean; error?: string }> {
    this.logger.emitSyncStatus('renewal', 'syncing', {
      userId: event.userId,
      productId: event.productId,
    });

    this.logger.logRenewalStart(event);

    try {
      await this.renewalHandler.processRenewal(event);

      subscriptionEventBus.emit(SUBSCRIPTION_EVENTS.RENEWAL_DETECTED, {
        userId: event.userId,
        productId: event.productId,
      });

      this.logger.emitSyncStatus('renewal', 'success', {
        userId: event.userId,
        productId: event.productId,
      });

      this.logger.logRenewalSuccess(event.userId, event.productId);

      return { success: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);

      this.logger.emitSyncStatus('renewal', 'error', {
        userId: event.userId,
        productId: event.productId,
        error: errorMsg,
      });

      this.logger.logRenewalError(event.userId, event.productId, errorMsg);

      return { success: false, error: errorMsg };
    }
  }

  async handlePremiumStatusChanged(event: PremiumStatusChangedEvent): Promise<{ success: boolean; error?: string }> {
    this.logger.logStatusChangeStart(event);

    try {
      await this.statusChangeHandler.processStatusChange(event);

      subscriptionEventBus.emit(SUBSCRIPTION_EVENTS.PREMIUM_STATUS_CHANGED, {
        userId: event.userId,
        isPremium: event.isPremium,
      });

      this.logger.logStatusChangeSuccess(event.userId, event.isPremium, event.productId);

      return { success: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);

      this.logger.logStatusChangeError(event.userId, event.isPremium, event.productId, errorMsg);

      return { success: false, error: errorMsg };
    }
  }
}
