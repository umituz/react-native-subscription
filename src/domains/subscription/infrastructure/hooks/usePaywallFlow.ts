/**
 * Paywall Flow Hook
 * Manages post-onboarding paywall state with persistence
 */

import { useState, useEffect, useCallback } from 'react';
import { useStorage } from '@umituz/react-native-design-system';

const PAYWALL_SHOWN_KEY = 'post_onboarding_paywall_shown';

export interface UsePaywallFlowOptions {
  showAfterOnboarding?: boolean;
}

export interface UsePaywallFlowResult {
  showPostOnboardingPaywall: boolean;
  paywallShown: boolean;
  closePostOnboardingPaywall: (isPremium: boolean) => Promise<void>;
  hidePostOnboardingPaywall: () => void;
  markPaywallShown: () => Promise<void>;
  setShowPostOnboardingPaywall: (show: boolean) => void;
}

export const usePaywallFlow = (options: UsePaywallFlowOptions = {}): UsePaywallFlowResult => {
  const { showAfterOnboarding = false } = options;
  const { getString, setString } = useStorage();
  const [showPostOnboardingPaywall, setShowPostOnboardingPaywall] = useState(showAfterOnboarding);
  const [paywallShown, setPaywallShown] = useState(false);

  // Load persisted state
  useEffect(() => {
    const loadPersistedState = async () => {
      try {
        const value = await getString(PAYWALL_SHOWN_KEY, '');
        setPaywallShown(value === 'true');
      } catch (error) {
        console.error('[usePaywallFlow] Failed to load paywall state', error);
        setPaywallShown(false); // Safe default
      }
    };

    loadPersistedState();
  }, [getString]);

  const closePostOnboardingPaywall = useCallback(async (_isPremium: boolean) => {
    await setString(PAYWALL_SHOWN_KEY, 'true');
    setShowPostOnboardingPaywall(false);
    setPaywallShown(true);
  }, [setString]);

  const hidePostOnboardingPaywall = useCallback(() => {
    setShowPostOnboardingPaywall(false);
  }, []);

  const markPaywallShown = useCallback(async () => {
    await setString(PAYWALL_SHOWN_KEY, 'true');
    setPaywallShown(true);
  }, [setString]);

  return {
    showPostOnboardingPaywall,
    paywallShown,
    closePostOnboardingPaywall,
    hidePostOnboardingPaywall,
    markPaywallShown,
    setShowPostOnboardingPaywall,
  };
};
