type EventCallback<T = unknown> = (data: T) => void;

class SubscriptionEventBus {
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
    this.listeners[event].push(callback as EventCallback);

    return () => {
      const listeners = this.listeners[event];
      if (listeners) {
        this.listeners[event] = listeners.filter(l => l !== callback);

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

  clear(event?: string): void {
    if (event) {
      delete this.listeners[event];
    } else {
      this.listeners = {};
    }
  }

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
