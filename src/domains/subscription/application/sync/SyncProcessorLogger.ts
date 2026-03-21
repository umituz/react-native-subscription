/**
 * Sync Processor Logger
 * Centralized logging for subscription sync operations
 */

import { subscriptionEventBus, SUBSCRIPTION_EVENTS } from "../../../../shared/infrastructure/SubscriptionEventBus";
import type { PurchaseCompletedEvent, RenewalDetectedEvent, PremiumStatusChangedEvent } from "../../core/SubscriptionEvents";
import { createLogger } from "../../../../shared/utils/logger";

const logger = createLogger("SubscriptionSyncProcessor");

export type SyncPhase = 'purchase' | 'renewal' | 'status_change';

export class SyncProcessorLogger {
  emitSyncStatus(phase: SyncPhase, status: 'syncing' | 'success' | 'error', data: {
    userId: string;
    productId: string;
    error?: string;
  }) {
    subscriptionEventBus.emit(SUBSCRIPTION_EVENTS.SYNC_STATUS_CHANGED, {
      status,
      phase,
      userId: data.userId,
      productId: data.productId,
      error: data.error,
    });
  }

  logPurchaseStart(event: PurchaseCompletedEvent) {
    logger.debug("PURCHASE START", {
      userId: event.userId,
      productId: event.productId,
      source: event.source,
      packageType: event.packageType,
      timestamp: new Date().toISOString(),
    });
  }

  logPurchaseSuccess(userId: string, productId: string) {
    logger.debug("PURCHASE SUCCESS", {
      userId,
      productId,
      timestamp: new Date().toISOString(),
    });
  }

  logPurchaseError(userId: string, productId: string, error: string) {
    logger.error("PURCHASE FAILED", error, { userId, productId, timestamp: new Date().toISOString() });
  }

  logRenewalStart(event: RenewalDetectedEvent) {
    logger.debug("RENEWAL START", {
      userId: event.userId,
      productId: event.productId,
      newExpirationDate: event.newExpirationDate,
      timestamp: new Date().toISOString(),
    });
  }

  logRenewalSuccess(userId: string, productId: string) {
    logger.debug("RENEWAL SUCCESS", {
      userId,
      productId,
      timestamp: new Date().toISOString(),
    });
  }

  logRenewalError(userId: string, productId: string, error: string) {
    logger.error("RENEWAL FAILED", error, { userId, productId, timestamp: new Date().toISOString() });
  }

  logStatusChangeStart(event: PremiumStatusChangedEvent) {
    logger.debug("STATUS CHANGE START", {
      userId: event.userId,
      isPremium: event.isPremium,
      productId: event.productId,
      willRenew: event.willRenew,
      expirationDate: event.expirationDate,
      timestamp: new Date().toISOString(),
    });
  }

  logStatusChangeSuccess(userId: string, isPremium: boolean, productId?: string) {
    logger.debug("STATUS CHANGE SUCCESS", {
      userId,
      isPremium,
      productId,
      timestamp: new Date().toISOString(),
    });
  }

  logStatusChangeError(userId: string, isPremium: boolean, productId: string | undefined, error: string) {
    logger.error("STATUS CHANGE FAILED", error, { userId, isPremium, productId, timestamp: new Date().toISOString() });
  }
}
