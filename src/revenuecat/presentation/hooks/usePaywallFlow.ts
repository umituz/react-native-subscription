/**
 * Paywall Flow Hook
 * Manages post-onboarding paywall state with persistence
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [showPostOnboardingPaywall, setShowPostOnboardingPaywall] = useState(showAfterOnboarding);
  const [paywallShown, setPaywallShown] = useState(false);

  // Load persisted state
  useEffect(() => {
    const loadPersistedState = async () => {
      const value = await AsyncStorage.getItem(PAYWALL_SHOWN_KEY);
      setPaywallShown(value === 'true');
    };

    loadPersistedState();
  }, []);

  const closePostOnboardingPaywall = useCallback(async (isPremium: boolean) => {
    await AsyncStorage.setItem(PAYWALL_SHOWN_KEY, 'true');
    setShowPostOnboardingPaywall(false);
    setPaywallShown(true);
  }, []);

  const hidePostOnboardingPaywall = useCallback(() => {
    setShowPostOnboardingPaywall(false);
  }, []);

  const markPaywallShown = useCallback(async () => {
    await AsyncStorage.setItem(PAYWALL_SHOWN_KEY, 'true');
    setPaywallShown(true);
  }, []);

  return {
    showPostOnboardingPaywall,
    paywallShown,
    closePostOnboardingPaywall,
    hidePostOnboardingPaywall,
    markPaywallShown,
    setShowPostOnboardingPaywall,
  };
};
