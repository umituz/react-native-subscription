type EventCallback<T = unknown> = (data: T) => void;
import { createLogger } from "../utils/logger";

const logger = createLogger("SubscriptionEventBus");

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

    // PERFORMANCE: Batch all callbacks in a single microtask to reduce call stack overhead
    // This prevents UI jank when multiple listeners are registered
    queueMicrotask(() => {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          logger.error("Listener error for event", error, { event });
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

// Re-export event constants for external use
export { SUBSCRIPTION_EVENTS } from "../../domains/subscription/core/events/SubscriptionEvents";
export { FLOW_EVENTS } from "../../domains/subscription/core/events/FlowEvents";
export type { SubscriptionEventType } from "../../domains/subscription/core/events/SubscriptionEvents";
export type { FlowEventType } from "../../domains/subscription/core/events/FlowEvents";

