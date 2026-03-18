import { useEffect, useRef } from "react";
import type { NavigationProp } from "@react-navigation/native";
import type { ImageSourcePropType } from "react-native";
import { usePremiumStatus } from "../../subscription/presentation/usePremiumStatus";
import { usePremiumPackages } from "../../subscription/presentation/usePremiumPackages";
import { usePremiumActions } from "../../subscription/presentation/usePremiumActions";
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
  const { isPremium, isSyncing, credits } = usePremiumStatus();
  const { packages } = usePremiumPackages();
  const { purchasePackage, restorePurchase } = usePremiumActions();

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
      if (hasNavigatedRef.current) return;
      hasNavigatedRef.current = true;

      if (__DEV__) console.log('[usePaywallOrchestrator] 🚀 Navigating to Paywall', {
        source: shouldShowPostOnboarding ? "onboarding" : "manual",
        packagesCount: packages.length
      });

      navigation.navigate("PaywallScreen", {
        translations,
        legalUrls,
        features,
        bestValueIdentifier,
        creditsLabel,
        heroImage,
        source: shouldShowPostOnboarding ? "onboarding" : "manual",
        packages,
        isPremium,
        credits,
        isSyncing,
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
