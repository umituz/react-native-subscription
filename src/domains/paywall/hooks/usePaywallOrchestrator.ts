import { useEffect, useCallback, useRef } from "react";
import { usePremium } from "../../subscription/presentation/usePremium";
import { useSubscriptionFlowStore } from "../../subscription/presentation/useSubscriptionFlow";
import { usePaywallVisibility } from "../../subscription/presentation/usePaywallVisibility";
import { PaywallTranslations, PaywallLegalUrls, SubscriptionFeature } from "../entities/types";

export interface PaywallOrchestratorOptions {
  navigation: any;
  translations: PaywallTranslations;
  features: SubscriptionFeature[];
  legalUrls: PaywallLegalUrls;
  heroImage: any;
  isNavReady?: boolean;
  isLocalizationReady?: boolean;
  onAuthRequired?: () => void;
  onPurchaseSuccess?: () => void;
  bestValueIdentifier?: string;
  creditsLabel?: string;
}

/**
 * High-level orchestrator for Paywall navigation.
 * Handles automatic triggers (post-onboarding) and manual triggers (showPaywall state).
 * Centralizes handlers for success, close, and feedback triggers.
 */
export function usePaywallOrchestrator({
  navigation,
  translations,
  features,
  legalUrls,
  heroImage,
  isNavReady = true,
  isLocalizationReady = true,
  onAuthRequired,
  onPurchaseSuccess,
  bestValueIdentifier = "yearly",
  creditsLabel,
}: PaywallOrchestratorOptions) {
  const {
    isPremium,
    packages,
    purchasePackage,
    restorePurchase
  } = usePremium();

  // Selectors for stable references and fine-grained updates
  const isOnboardingComplete = useSubscriptionFlowStore((state) => state.isOnboardingComplete);
  const showPostOnboardingPaywall = useSubscriptionFlowStore((state) => state.showPostOnboardingPaywall);
  const paywallShown = useSubscriptionFlowStore((state) => state.paywallShown);
  const isAuthModalOpen = useSubscriptionFlowStore((state) => state.isAuthModalOpen);
  const showFeedback = useSubscriptionFlowStore((state) => state.showFeedback);
  const markPaywallShown = useSubscriptionFlowStore((state) => state.markPaywallShown);
  const closePostOnboardingPaywall = useSubscriptionFlowStore((state) => state.closePostOnboardingPaywall);
  const setShowFeedback = useSubscriptionFlowStore((state) => state.setShowFeedback);

  const { showPaywall, closePaywall } = usePaywallVisibility();
  const purchasedRef = useRef(false);
  const hasNavigatedRef = useRef(false);

  const handleClose = useCallback(async () => {
    await closePostOnboardingPaywall();
    closePaywall();

    // Trigger feedback if user declined and isn't premium
    if (!isPremium && !purchasedRef.current) {
      setTimeout(() => setShowFeedback(true), 300);
    }

    purchasedRef.current = false;
    hasNavigatedRef.current = false;

    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [closePostOnboardingPaywall, closePaywall, isPremium, navigation, setShowFeedback]);

  const handleSuccess = useCallback(async () => {
    purchasedRef.current = true;
    await markPaywallShown();
    await closePostOnboardingPaywall();

    onPurchaseSuccess?.();

    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [markPaywallShown, closePostOnboardingPaywall, onPurchaseSuccess, navigation]);

  useEffect(() => {
    if (!isNavReady || !isLocalizationReady) return;

    const shouldShowPostOnboarding =
      isOnboardingComplete &&
      showPostOnboardingPaywall &&
      !paywallShown &&
      !isAuthModalOpen &&
      !isPremium;

    const shouldShowManual = showPaywall && !isPremium && !isAuthModalOpen;

    if (shouldShowPostOnboarding || shouldShowManual) {
      // Guard against double navigation in same render cycle
      if (hasNavigatedRef.current) return;
      hasNavigatedRef.current = true;

      if (__DEV__) console.log('[usePaywallOrchestrator] 🚀 Navigating to Paywall', { 
        source: shouldShowPostOnboarding ? "onboarding" : "manual" 
      });

      navigation.navigate("PaywallScreen", {
        onClose: handleClose,
        translations,
        legalUrls,
        features,
        bestValueIdentifier,
        creditsLabel,
        onAuthRequired,
        onPurchaseSuccess: handleSuccess,
        heroImage,
        source: shouldShowPostOnboarding ? "onboarding" : "manual",
        packages,
        onPurchase: purchasePackage,
        onRestore: restorePurchase,
      });

      if (shouldShowPostOnboarding) {
        markPaywallShown();
      }
      
      if (showPaywall) {
        closePaywall();
      }
    } else {
      // Reset navigation flag if conditions no longer met
      hasNavigatedRef.current = false;
    }
  }, [
    isNavReady,
    isLocalizationReady,
    isOnboardingComplete,
    showPostOnboardingPaywall,
    paywallShown,
    isAuthModalOpen,
    isPremium,
    showPaywall,
    navigation,
    handleClose,
    handleSuccess,
    translations,
    legalUrls,
    features,
    heroImage,
    packages,
    purchasePackage,
    restorePurchase,
    markPaywallShown,
    closePaywall,
    bestValueIdentifier,
    creditsLabel,
    onAuthRequired
  ]);

  const completeOnboarding = useSubscriptionFlowStore((state) => state.completeOnboarding);

  return {
    isPremium,
    packages,
    flowState: {
      isOnboardingComplete,
      showPostOnboardingPaywall,
      paywallShown,
      isAuthModalOpen,
      showFeedback
    },
    markPaywallShown,
    closePostOnboardingPaywall,
    completeOnboarding,
    setShowFeedback
  };
}
