/**
 * Subscription-related events
 * Events emitted during subscription lifecycle operations
 */

export const SUBSCRIPTION_EVENTS = {
  CREDITS_UPDATED: "credits_updated",
  PURCHASE_COMPLETED: "purchase_completed",
  RENEWAL_DETECTED: "renewal_detected",
  PREMIUM_STATUS_CHANGED: "premium_status_changed",
  SYNC_STATUS_CHANGED: "sync_status_changed",
} as const;

export type SubscriptionEventType = typeof SUBSCRIPTION_EVENTS[keyof typeof SUBSCRIPTION_EVENTS];

export interface SyncStatusChangedEvent {
  status: 'syncing' | 'success' | 'error';
  phase: 'purchase' | 'renewal';
  userId?: string;
  productId?: string;
  error?: string;
}
