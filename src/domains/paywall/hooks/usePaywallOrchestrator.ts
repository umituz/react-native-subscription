import { useEffect, useRef } from "react";
import type { NavigationProp } from "@react-navigation/native";
import type { ImageSourcePropType } from "react-native";
import { usePremium } from "../../subscription/presentation/usePremium";
import { useSubscriptionFlowStore } from "../../subscription/presentation/useSubscriptionFlow";
import { usePaywallVisibility } from "../../subscription/presentation/usePaywallVisibility";
import { PaywallTranslations, PaywallLegalUrls, SubscriptionFeature } from "../entities/types";

export interface PaywallOrchestratorOptions {
  navigation: NavigationProp<any>;
  translations: PaywallTranslations;
  features: SubscriptionFeature[];
  legalUrls: PaywallLegalUrls;
  heroImage: ImageSourcePropType;
  isNavReady?: boolean;
  isLocalizationReady?: boolean;
  bestValueIdentifier?: string;
  creditsLabel?: string;
}

/**
 * High-level orchestrator for Paywall navigation.
 * Handles automatic triggers (post-onboarding) and manual triggers (showPaywall state).
 * Centralizes handlers for success, close, and feedback triggers.
 *
 * This orchestrator fetches all subscription data and passes it to PaywallScreen as props.
 * PaywallScreen is now a "dumb" component that doesn't call usePremium internally.
 */
export function usePaywallOrchestrator({
  navigation,
  translations,
  features,
  legalUrls,
  heroImage,
  isNavReady = true,
  isLocalizationReady = true,
  bestValueIdentifier = "yearly",
  creditsLabel,
}: PaywallOrchestratorOptions) {
  // Get all premium data and actions from usePremium
  const {
    isPremium,
    packages,
    credits,
    isSyncing,
    purchasePackage,
    restorePurchase,
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
  const hasNavigatedRef = useRef(false);

  const handleClose = () => {
    closePaywall();
  };

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
        source: shouldShowPostOnboarding ? "onboarding" : "manual",
        packagesCount: packages.length
      });

      // Pass all data and actions as props - PaywallScreen is now a dumb component
      navigation.navigate("PaywallScreen", {
        // UI Props
        translations,
        legalUrls,
        features,
        bestValueIdentifier,
        creditsLabel,
        heroImage,
        source: shouldShowPostOnboarding ? "onboarding" : "manual",

        // Data Props
        packages,
        isPremium,
        credits,
        isSyncing,

        // Action Props
        onPurchase: purchasePackage,
        onRestore: restorePurchase,
        onClose: handleClose,
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
    translations,
    legalUrls,
    features,
    heroImage,
    packages,
    markPaywallShown,
    closePaywall,
    bestValueIdentifier,
    creditsLabel,
    credits,
    isSyncing,
    purchasePackage,
    restorePurchase,
    handleClose,
  ]);

  const completeOnboarding = useSubscriptionFlowStore((state) => state.completeOnboarding);

  return {
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
