type EventCallback<T = unknown> = (data: T) => void;

class SubscriptionEventBus {
  private static instance: SubscriptionEventBus;
  private listeners: Map<string, Set<EventCallback>> = new Map();

  private constructor() {}

  static getInstance(): SubscriptionEventBus {
    if (!SubscriptionEventBus.instance) {
      SubscriptionEventBus.instance = new SubscriptionEventBus();
    }
    return SubscriptionEventBus.instance;
  }

  on<T>(event: string, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    const eventSet = this.listeners.get(event)!;
    eventSet.add(callback as EventCallback);

    return () => {
      const listeners = this.listeners.get(event);
      if (listeners) {
        listeners.delete(callback as EventCallback);
        if (listeners.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  emit<T>(event: string, data: T): void {
    const listeners = this.listeners.get(event);
    if (!listeners || listeners.size === 0) return;

    // Use microtask for async execution to not block main thread
    // but keep it fast.
    listeners.forEach(callback => {
      queueMicrotask(() => {
        try {
          callback(data);
        } catch (error) {
          console.error('[SubscriptionEventBus] Listener error for event:', event, { error });
        }
      });
    });
  }

  clear(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  getListenerCount(event?: string): number {
    if (event) {
      return this.listeners.get(event)?.size ?? 0;
    }
    let total = 0;
    this.listeners.forEach(set => {
      total += set.size;
    });
    return total;
  }
}

export const subscriptionEventBus = SubscriptionEventBus.getInstance();

export const SUBSCRIPTION_EVENTS = {
  CREDITS_UPDATED: "credits_updated",
  PURCHASE_COMPLETED: "purchase_completed",
  RENEWAL_DETECTED: "renewal_detected",
  PREMIUM_STATUS_CHANGED: "premium_status_changed",
  SYNC_STATUS_CHANGED: "sync_status_changed",
} as const;

export const FLOW_EVENTS = {
  ONBOARDING_COMPLETED: "flow_onboarding_completed",
  PAYWALL_SHOWN: "flow_paywall_shown",
  PAYWALL_CLOSED: "flow_paywall_closed",
} as const;

export type SubscriptionEventType = typeof SUBSCRIPTION_EVENTS[keyof typeof SUBSCRIPTION_EVENTS];
export type FlowEventType = typeof FLOW_EVENTS[keyof typeof FLOW_EVENTS];
