import { useEffect } from "react";
import { subscriptionEventBus, SUBSCRIPTION_EVENTS } from "../../../shared/infrastructure/SubscriptionEventBus";
import { useSubscriptionFlowStore, SyncStatus } from "./useSubscriptionFlow";
import { createLogger } from "../../../shared/utils/logger";

const logger = createLogger("useSyncStatusListener");

interface SyncStatusEvent {
  status: 'syncing' | 'success' | 'error';
  phase: 'purchase' | 'renewal';
  userId?: string;
  productId?: string;
  error?: string;
}

/**
 * Hook that listens to sync status events from the application layer
 * and updates the presentation layer's Zustand store accordingly.
 *
 * This maintains clean architecture separation: Application layer emits events,
 * Presentation layer consumes them and updates its own state.
 */
export function useSyncStatusListener() {
  const setSyncStatus = useSubscriptionFlowStore((state) => state.setSyncStatus);

  useEffect(() => {
    const unsubscribe = subscriptionEventBus.on<SyncStatusEvent>(
      SUBSCRIPTION_EVENTS.SYNC_STATUS_CHANGED,
      (event) => {
        const syncStatus = event.status === 'syncing' ? SyncStatus.SYNCING :
                          event.status === 'success' ? SyncStatus.SUCCESS :
                          SyncStatus.ERROR;

        setSyncStatus(syncStatus, event.error);

        logger.debug("Sync status updated", {
          status: event.status,
          phase: event.phase,
          userId: event.userId,
          productId: event.productId,
          error: event.error,
        });
      }
    );

    return unsubscribe;
  }, [setSyncStatus]);
}
