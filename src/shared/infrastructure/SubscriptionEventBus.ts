type EventCallback<T = unknown> = (data: T) => void;

/**
 * Simple EventBus Implementation
 * Used to decouple services and provide an observer pattern for subscription events.
 */
export class SubscriptionEventBus {
  private static instance: SubscriptionEventBus;
  private listeners: Record<string, EventCallback<any>[]> = {};

  private constructor() {}

  static getInstance(): SubscriptionEventBus {
    if (!SubscriptionEventBus.instance) {
      SubscriptionEventBus.instance = new SubscriptionEventBus();
    }
    return SubscriptionEventBus.instance;
  }

  on<T>(event: string, callback: EventCallback<T>): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners[event];
      if (listeners) {
        this.listeners[event] = listeners.filter(l => l !== callback);

        // Clean up empty event arrays to prevent memory leak
        if (this.listeners[event].length === 0) {
          delete this.listeners[event];
        }
      }
    };
  }

  emit<T>(event: string, data: T): void {
    if (!this.listeners[event]) return;

    this.listeners[event].forEach(callback => {
      Promise.resolve().then(() => {
        try {
          callback(data);
        } catch (error) {
          console.error('[SubscriptionEventBus] Listener error for event:', event, { error });
        }
      }).catch(error => {
        console.error('[SubscriptionEventBus] Async listener error for event:', event, { error });
      });
    });
  }

  /**
   * Clear all listeners for a specific event or all events
   * Useful for cleanup during testing or app state reset
   */
  clear(event?: string): void {
    if (event) {
      delete this.listeners[event];
    } else {
      this.listeners = {};
    }
  }

  /**
   * Get listener count for debugging
   */
  getListenerCount(event?: string): number {
    if (event) {
      return this.listeners[event]?.length ?? 0;
    }
    return Object.values(this.listeners).reduce((total, arr) => total + arr.length, 0);
  }
}

export const subscriptionEventBus = SubscriptionEventBus.getInstance();

export const SUBSCRIPTION_EVENTS = {
  CREDITS_UPDATED: "credits_updated",
  PURCHASE_COMPLETED: "purchase_completed",
  RENEWAL_DETECTED: "renewal_detected",
  PREMIUM_STATUS_CHANGED: "premium_status_changed",
};
