/**
 * Paywall Visibility Hook
 * Simple global state for paywall visibility using module-level state
 * Generic implementation for 100+ apps
 */

import { useCallback, useSyncExternalStore } from "react";

type Listener = () => void;

let paywallVisible = false;
const listeners = new Set<Listener>();

const subscribe = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = (): boolean => paywallVisible;

const setPaywallVisible = (visible: boolean): void => {
  paywallVisible = visible;
  listeners.forEach((listener) => listener());
};

/**
 * Direct paywall control for non-React contexts (e.g., appInitializer)
 */
export const paywallControl = {
  open: () => setPaywallVisible(true),
  close: () => setPaywallVisible(false),
  isOpen: () => paywallVisible,
};

export interface UsePaywallVisibilityResult {
  showPaywall: boolean;
  setShowPaywall: (visible: boolean) => void;
  openPaywall: () => void;
  closePaywall: () => void;
}

export function usePaywallVisibility(): UsePaywallVisibilityResult {
  const showPaywall = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const setShowPaywall = useCallback((visible: boolean) => {
    setPaywallVisible(visible);
  }, []);

  const openPaywall = useCallback(() => {
    setPaywallVisible(true);
  }, []);

  const closePaywall = useCallback(() => {
    setPaywallVisible(false);
  }, []);

  return {
    showPaywall,
    setShowPaywall,
    openPaywall,
    closePaywall,
  };
}
