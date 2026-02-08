/**
 * Paywall Visibility Hook
 * Simple global state for paywall visibility using module-level state
 * Generic implementation for 100+ apps
 */

import { useCallback, useSyncExternalStore } from "react";
import type { PurchaseSource } from "../../credits/core/Credits";

type Listener = () => void;

interface PaywallState {
  visible: boolean;
  source?: PurchaseSource;
}

let paywallState: PaywallState = { visible: false, source: undefined };
const listeners = new Set<Listener>();

const subscribe = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = (): PaywallState => paywallState;

const setPaywallState = (visible: boolean, source?: PurchaseSource): void => {
  paywallState = { visible, source };
  listeners.forEach((listener) => listener());
};

/**
 * Direct paywall control for non-React contexts (e.g., appInitializer)
 */
export const paywallControl = {
  open: (source?: PurchaseSource) => setPaywallState(true, source),
  close: () => setPaywallState(false, undefined),
  isOpen: () => paywallState.visible,
  getSource: () => paywallState.source,
};

export interface UsePaywallVisibilityResult {
  showPaywall: boolean;
  currentSource?: PurchaseSource;
  setShowPaywall: (visible: boolean, source?: PurchaseSource) => void;
  openPaywall: (source?: PurchaseSource) => void;
  closePaywall: () => void;
}

export function usePaywallVisibility(): UsePaywallVisibilityResult {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const setShowPaywall = useCallback((visible: boolean, source?: PurchaseSource) => {
    setPaywallState(visible, source);
  }, []);

  const openPaywall = useCallback((source?: PurchaseSource) => {
    setPaywallState(true, source);
  }, []);

  const closePaywall = useCallback(() => {
    setPaywallState(false, undefined);
  }, []);

  return {
    showPaywall: state.visible,
    currentSource: state.source,
    setShowPaywall,
    openPaywall,
    closePaywall,
  };
}
