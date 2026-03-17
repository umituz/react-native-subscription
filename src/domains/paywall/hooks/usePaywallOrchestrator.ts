import { useEffect, useCallback, useRef } from "react";
import { usePremium } from "../../subscription/presentation/usePremium";
import { useSubscriptionFlow } from "../../subscription/presentation/useSubscriptionFlow";
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
  
  const { 
    state, 
    markPaywallShown, 
    closePostOnboardingPaywall, 
    setShowFeedback 
  } = useSubscriptionFlow();
  
  const { showPaywall, closePaywall } = usePaywallVisibility();
  const purchasedRef = useRef(false);

  const handleClose = useCallback(async () => {
    await closePostOnboardingPaywall();
    closePaywall();
    
    // Trigger feedback if user declined and isn't premium
    if (!isPremium && !purchasedRef.current) {
      setTimeout(() => setShowFeedback(true), 300);
    }
    
    purchasedRef.current = false;
    
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
      state.isOnboardingComplete && 
      state.showPostOnboardingPaywall && 
      !state.paywallShown && 
      !state.isAuthModalOpen && 
      !isPremium;

    const shouldShowManual = showPaywall && !isPremium && !state.isAuthModalOpen;

    if (shouldShowPostOnboarding || shouldShowManual) {
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
    }
  }, [
    isNavReady,
    isLocalizationReady,
    state.isOnboardingComplete,
    state.showPostOnboardingPaywall,
    state.paywallShown,
    state.isAuthModalOpen,
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

  return { 
    isPremium, 
    packages, 
    flowState: state,
    markPaywallShown,
    closePostOnboardingPaywall,
    setShowFeedback
  };
}
