import React, { createContext, useContext, useEffect } from "react";
import { useSubscriptionFlowStore, SubscriptionFlowStatus } from "../useSubscriptionFlow";
import { useSyncStatusListener } from "../useSyncStatusListener";
import { initializationState } from "../../infrastructure/state/initializationState";
import { createLogger } from "../../../../shared/utils/logger";

const logger = createLogger("SubscriptionFlowProvider");

interface SubscriptionFlowContextType {
  status: SubscriptionFlowStatus;
}

const SubscriptionFlowContext = createContext<SubscriptionFlowContextType | undefined>(undefined);

export const SubscriptionFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Listen to sync status events from application layer
  useSyncStatusListener();

  // Selectors for stable references and only what we need
  const isInitialized = useSubscriptionFlowStore((state) => state.isInitialized);
  const isOnboardingComplete = useSubscriptionFlowStore((state) => state.isOnboardingComplete);
  const status = useSubscriptionFlowStore((state) => state.status);
  const setInitialized = useSubscriptionFlowStore((state) => state.setInitialized);
  const setStatus = useSubscriptionFlowStore((state) => state.setStatus);

  useEffect(() => {
    // 1. Listen to background initialization state
    const unsubscribe = initializationState.subscribe(() => {
      const { initialized } = initializationState.getSnapshot();
      logger.debug("Initialization status updated", { initialized });
      if (initialized && !isInitialized) {
        setInitialized(true);
      }
    });

    // Check initial state
    const { initialized: currentlyInitialized } = initializationState.getSnapshot();
    if (currentlyInitialized && !isInitialized) {
      logger.debug("Already initialized on mount");
      setInitialized(true);
    }

    return () => unsubscribe();
  }, [isInitialized, setInitialized]);

  useEffect(() => {
    // This effect manages the overall flow status transition
    logger.debug("Calculating Status Transition", {
      isInitialized,
      isOnboardingComplete,
      currentStatus: status
    });

    let nextStatus = SubscriptionFlowStatus.READY;

    if (!isInitialized) {
      nextStatus = SubscriptionFlowStatus.INITIALIZING;
    } else if (!isOnboardingComplete) {
      nextStatus = SubscriptionFlowStatus.ONBOARDING;
    } else if (
      status === SubscriptionFlowStatus.ONBOARDING ||
      status === SubscriptionFlowStatus.INITIALIZING
    ) {
      // First time completing onboarding - transition to CHECK_PREMIUM once
      nextStatus = SubscriptionFlowStatus.CHECK_PREMIUM;
    } else {
      // Already past onboarding - let ManagedSubscriptionFlow control the flow
      nextStatus = status;
    }

    if (nextStatus !== status) {
       logger.debug("Transitioning status to", nextStatus);
       setStatus(nextStatus);
    }
  }, [
    isInitialized,
    isOnboardingComplete,
    status,
    setStatus
  ]);

  return (
    <SubscriptionFlowContext.Provider value={{ status: status }}>
      {children}
    </SubscriptionFlowContext.Provider>
  );
};

export const useSubscriptionFlowStatus = () => {
  const context = useContext(SubscriptionFlowContext);
  if (context === undefined) {
    throw new Error("useSubscriptionFlowStatus must be used within a SubscriptionFlowProvider");
  }
  return context.status;
};
