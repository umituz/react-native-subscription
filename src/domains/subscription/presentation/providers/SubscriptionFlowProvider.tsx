import React, { createContext, useContext, useEffect } from "react";
import { useSubscriptionFlowStore, SubscriptionFlowStatus } from "../useSubscriptionFlow";
import { useSyncStatusListener } from "../useSyncStatusListener";
import { initializationState } from "../../infrastructure/state/initializationState";

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
      if (__DEV__) {
        console.log('[SubscriptionFlowProvider] 🔄 Initialization status updated:', { initialized });
      }
      if (initialized && !isInitialized) {
        setInitialized(true);
      }
    });

    // Check initial state
    const { initialized: currentlyInitialized } = initializationState.getSnapshot();
    if (currentlyInitialized && !isInitialized) {
      if (__DEV__) console.log('[SubscriptionFlowProvider] ✅ Already initialized on mount');
      setInitialized(true);
    }

    return () => unsubscribe();
  }, [isInitialized, setInitialized]);

  useEffect(() => {
    // This effect manages the overall flow status transition
    if (__DEV__) {
       console.log('[SubscriptionFlowProvider] 🧠 Calculating Status Transition', {
         isInitialized,
         isOnboardingComplete,
         currentStatus: status
       });
    }

    let nextStatus = SubscriptionFlowStatus.READY;

    if (!isInitialized) {
      nextStatus = SubscriptionFlowStatus.INITIALIZING;
    } else if (!isOnboardingComplete) {
      nextStatus = SubscriptionFlowStatus.ONBOARDING;
    } else {
      // Onboarding complete - let ManagedSubscriptionFlow handle CHECK_PREMIUM
      nextStatus = SubscriptionFlowStatus.CHECK_PREMIUM;
    }

    if (nextStatus !== status) {
       if (__DEV__) console.log('[SubscriptionFlowProvider] 🚀 Transitioning status to:', nextStatus);
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
