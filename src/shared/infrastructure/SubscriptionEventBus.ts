type EventCallback<T = any> = (data: T) => void;

/**
 * Simple EventBus Implementation
 * Used to decouple services and provide an observer pattern for subscription events.
 */
export class SubscriptionEventBus {
  private static instance: SubscriptionEventBus;
  private listeners: Record<string, EventCallback[]> = {};

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
      }
    };
  }

  emit<T>(event: string, data: T): void {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        if (__DEV__) console.error(`[SubscriptionEventBus] Error in listener for ${event}:`, error);
      }
    });
  }
}

export const subscriptionEventBus = SubscriptionEventBus.getInstance();

export const SUBSCRIPTION_EVENTS = {
  CREDITS_UPDATED: "credits_updated",
  PURCHASE_COMPLETED: "purchase_completed",
  RENEWAL_DETECTED: "renewal_detected",
  PREMIUM_STATUS_CHANGED: "premium_status_changed",
};
