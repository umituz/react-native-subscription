/**
 * Sync Processor Logger
 * Centralized logging for subscription sync operations
 */

import { subscriptionEventBus, SUBSCRIPTION_EVENTS } from "../../../../shared/infrastructure/SubscriptionEventBus";
import type { PurchaseCompletedEvent, RenewalDetectedEvent, PremiumStatusChangedEvent } from "../../core/SubscriptionEvents";

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
    if (__DEV__) {
      console.log('[SubscriptionSyncProcessor] 🔵 PURCHASE START', {
        userId: event.userId,
        productId: event.productId,
        source: event.source,
        packageType: event.packageType,
        timestamp: new Date().toISOString(),
      });
    }
  }

  logPurchaseSuccess(userId: string, productId: string) {
    if (__DEV__) {
      console.log('[SubscriptionSyncProcessor] 🟢 PURCHASE SUCCESS', {
        userId,
        productId,
        timestamp: new Date().toISOString(),
      });
    }
  }

  logPurchaseError(userId: string, productId: string, error: string) {
    console.error('[SubscriptionSyncProcessor] 🔴 PURCHASE FAILED', {
      userId,
      productId,
      error,
      timestamp: new Date().toISOString(),
    });
  }

  logRenewalStart(event: RenewalDetectedEvent) {
    if (__DEV__) {
      console.log('[SubscriptionSyncProcessor] 🔵 RENEWAL START', {
        userId: event.userId,
        productId: event.productId,
        newExpirationDate: event.newExpirationDate,
        timestamp: new Date().toISOString(),
      });
    }
  }

  logRenewalSuccess(userId: string, productId: string) {
    if (__DEV__) {
      console.log('[SubscriptionSyncProcessor] 🟢 RENEWAL SUCCESS', {
        userId,
        productId,
        timestamp: new Date().toISOString(),
      });
    }
  }

  logRenewalError(userId: string, productId: string, error: string) {
    console.error('[SubscriptionSyncProcessor] 🔴 RENEWAL FAILED', {
      userId,
      productId,
      error,
      timestamp: new Date().toISOString(),
    });
  }

  logStatusChangeStart(event: PremiumStatusChangedEvent) {
    if (__DEV__) {
      console.log('[SubscriptionSyncProcessor] 🔵 STATUS CHANGE START', {
        userId: event.userId,
        isPremium: event.isPremium,
        productId: event.productId,
        willRenew: event.willRenew,
        expirationDate: event.expirationDate,
        timestamp: new Date().toISOString(),
      });
    }
  }

  logStatusChangeSuccess(userId: string, isPremium: boolean, productId?: string) {
    if (__DEV__) {
      console.log('[SubscriptionSyncProcessor] 🟢 STATUS CHANGE SUCCESS', {
        userId,
        isPremium,
        productId,
        timestamp: new Date().toISOString(),
      });
    }
  }

  logStatusChangeError(userId: string, isPremium: boolean, productId: string | undefined, error: string) {
    console.error('[SubscriptionSyncProcessor] 🔴 STATUS CHANGE FAILED', {
      userId,
      isPremium,
      productId,
      error,
      timestamp: new Date().toISOString(),
    });
  }
}
