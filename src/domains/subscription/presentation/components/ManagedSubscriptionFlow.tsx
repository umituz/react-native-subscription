import React, { useState, useEffect } from "react";
import { SplashScreen, useSplashFlow } from "@umituz/react-native-design-system/molecules";
import { OnboardingScreen } from "@umituz/react-native-design-system/onboarding";
import { OfflineBanner } from "@umituz/react-native-design-system/offline";
import { useAppDesignTokens } from "@umituz/react-native-design-system/theme";
import { usePaywallOrchestrator } from "../../../paywall/hooks/usePaywallOrchestrator";
import { PaywallFeedbackScreen } from "../../../subscription/presentation/components/feedback/PaywallFeedbackScreen";
import { PaywallFeedbackTranslations } from "../../../subscription/presentation/components/feedback/PaywallFeedbackScreen.types";
import { PaywallTranslations, PaywallLegalUrls, SubscriptionFeature } from "../../../paywall/entities/types";
import { usePaywallFeedbackSubmit } from "../../../../presentation/hooks/feedback/useFeedbackSubmit";

export interface ManagedSubscriptionFlowProps {
  children: React.ReactNode;
  navigation: any;
  islocalizationReady: boolean;

  // Splash Configuration
  splash?: {
    appName: string;
    tagline: string;
    duration?: number;
  };

  // Onboarding Configuration
  onboarding: {
    slides: any[];
    translations: {
      nextButton: string;
      getStartedButton: string;
      of: string;
    };
    themeColors: any;
    showSkipButton?: boolean;
    showBackButton?: boolean;
    showProgressBar?: boolean;
  };

  // Paywall Configuration
  paywall: {
    translations: PaywallTranslations;
    features: SubscriptionFeature[];
    legalUrls: PaywallLegalUrls;
    heroImage: any;
    bestValueIdentifier?: string;
    creditsLabel?: string;
    onAuthRequired?: () => void;
    onPurchaseSuccess?: () => void;
  };

  // Feedback Configuration
  feedback: {
    translations: PaywallFeedbackTranslations;
    onSubmit?: (data: { reason: string; otherText?: string }) => void | Promise<void>;
  };

  // Offline Configuration
  offline?: {
    isOffline: boolean;
    message: string;
    backgroundColor?: string;
    position?: "top" | "bottom";
  };
}

/**
 * ManagedSubscriptionFlow
 * 
 * A high-level layout component that orchestrates the entire application flow:
 * Splash -> Onboarding -> [Managed Paywall Screens] -> Main Application Stack.
 * 
 * Use this to reduce AppNavigator boilerplate to nearly zero.
 */
export const ManagedSubscriptionFlow: React.FC<ManagedSubscriptionFlowProps> = ({
  children,
  navigation,
  islocalizationReady,
  splash,
  onboarding,
  paywall,
  feedback,
  offline,
}) => {
  const tokens = useAppDesignTokens();
  const { isInitialized: isSplashComplete } = useSplashFlow({
    duration: splash?.duration || 0,
  });
  
  const [isNavReady, setIsNavReady] = useState(false);

  // Mark navigation tree as ready after splash and localization
  useEffect(() => {
    if (isSplashComplete && islocalizationReady) {
      const timer = setTimeout(() => setIsNavReady(true), 500);
      return () => clearTimeout(timer);
    }
  }, [isSplashComplete, islocalizationReady]);

  const { 
    flowState, 
    setShowFeedback 
  } = usePaywallOrchestrator({
    navigation,
    isNavReady,
    isLocalizationReady: islocalizationReady,
    translations: paywall.translations,
    features: paywall.features,
    legalUrls: paywall.legalUrls,
    heroImage: paywall.heroImage,
    onAuthRequired: paywall.onAuthRequired,
    onPurchaseSuccess: paywall.onPurchaseSuccess,
    bestValueIdentifier: paywall.bestValueIdentifier,
    creditsLabel: paywall.creditsLabel,
  });

  const { submit: internalSubmit } = usePaywallFeedbackSubmit();

  const handleFeedbackSubmit = async (data: { reason: string; otherText?: string }) => {
    if (feedback.onSubmit) {
      await feedback.onSubmit(data);
    } else {
      const description = data.otherText ? `${data.reason}: ${data.otherText}` : data.reason;
      await internalSubmit(description);
    }
  };

  // 1. Loading / Splash State
  if (splash && (!isSplashComplete || !flowState.isInitialized || !islocalizationReady)) {
    return (
      <SplashScreen
        appName={splash.appName}
        tagline={splash.tagline}
        colors={tokens.colors}
      />
    );
  }

  // If no splash and not ready, show minimal loading
  if (!splash && (!flowState.isInitialized || !islocalizationReady)) {
    return null;
  }

  // 2. Onboarding State
  if (!flowState.isOnboardingComplete) {
    return (
      <OnboardingScreen
        slides={onboarding.slides}
        onComplete={flowState.completeOnboarding}
        showSkipButton={onboarding.showSkipButton ?? true}
        showBackButton={onboarding.showBackButton ?? true}
        showProgressBar={onboarding.showProgressBar ?? true}
        themeColors={onboarding.themeColors}
        translations={onboarding.translations}
      />
    );
  }

  // 3. Main Application State
  return (
    <>
      {children}
      
      {offline && (
        <OfflineBanner
          visible={offline.isOffline}
          message={offline.message}
          backgroundColor={offline.backgroundColor || tokens.colors.error}
          position={offline.position || "top"}
        />
      )}

      {flowState.showFeedback && (
        <PaywallFeedbackScreen
          onClose={() => setShowFeedback(false)}
          onSubmit={handleFeedbackSubmit}
          translations={feedback.translations}
        />
      )}
    </>
  );
};
