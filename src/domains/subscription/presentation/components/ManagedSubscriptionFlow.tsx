import React, { useState, useEffect, useCallback } from "react";
import type { NavigationProp } from "@react-navigation/native";
import type { ImageSourcePropType } from "react-native";
import { SplashScreen, useSplashFlow } from "@umituz/react-native-design-system/molecules";
import { OnboardingScreen } from "@umituz/react-native-design-system/onboarding";
import { OfflineBanner } from "@umituz/react-native-design-system/offline";
import { useAppDesignTokens } from "@umituz/react-native-design-system/theme";
import { usePremiumStatus } from "../../presentation/usePremiumStatus";
import { usePremiumPackages } from "../../presentation/usePremiumPackages";
import { usePremiumActions } from "../../presentation/usePremiumActions";
import { usePaywallOrchestrator } from "../../../paywall/hooks/usePaywallOrchestrator";
import { PaywallFeedbackScreen } from "../../../subscription/presentation/components/feedback/PaywallFeedbackScreen";
import { PaywallFeedbackTranslations } from "../../../subscription/presentation/components/feedback/PaywallFeedbackScreen.types";
import { PaywallTranslations, PaywallLegalUrls, SubscriptionFeature } from "../../../paywall/entities/types";
import { usePaywallFeedbackSubmit } from "../../../../presentation/hooks/feedback/useFeedbackSubmit";
import { PaywallScreen } from "../../../paywall/components/PaywallScreen";

export interface ManagedSubscriptionFlowProps {
  children: React.ReactNode;
  navigation: NavigationProp<any>;
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
    heroImage: ImageSourcePropType;
    bestValueIdentifier?: string;
    creditsLabel?: string;
  };

  // Feedback Configuration
  feedback: {
    translations: PaywallFeedbackTranslations;
    onSubmit?: (data: { reason: string; otherText?: string }) => void | Promise<void>;
  };

  // Offline Configuration (optional)
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
import {
  SubscriptionFlowProvider,
  useSubscriptionFlowStatus
} from "../providers/SubscriptionFlowProvider";
import { useSubscriptionFlowStore, SubscriptionFlowStatus } from "../useSubscriptionFlow";

const ManagedSubscriptionFlowInner = React.memo<ManagedSubscriptionFlowProps>(({
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
  const status = useSubscriptionFlowStatus();
  const { isInitialized: isSplashComplete } = useSplashFlow({
    duration: splash?.duration || 0,
  });

  // Hooks for paywall (called at component level, not inside conditional render)
  const { isPremium, isSyncing, credits } = usePremiumStatus();
  const { packages } = usePremiumPackages();
  const { purchasePackage: originalPurchasePackage, restorePurchase } = usePremiumActions();
  const { closePostOnboardingPaywall } = useSubscriptionFlowStore();

  // Track if purchase was successful to avoid showing feedback
  const [purchaseSuccessful, setPurchaseSuccessful] = useState(false);

  // Wrap purchasePackage to track success
  const purchasePackage = useCallback(async (pkgId: string) => {
    const result = await originalPurchasePackage(pkgId);
    if (result?.success) {
      setPurchaseSuccessful(true);
    }
    return result;
  }, [originalPurchasePackage]);

  // Wrap onClose to pass purchase status
  const handleClose = useCallback(() => {
    closePostOnboardingPaywall({ purchased: purchaseSuccessful });
  }, [closePostOnboardingPaywall, purchaseSuccessful]);

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
    setShowFeedback,
    completeOnboarding
  } = usePaywallOrchestrator({
    navigation,
    isNavReady,
    isLocalizationReady: islocalizationReady,
    translations: paywall.translations,
    features: paywall.features,
    legalUrls: paywall.legalUrls,
    heroImage: paywall.heroImage,
    bestValueIdentifier: paywall.bestValueIdentifier,
    creditsLabel: paywall.creditsLabel,
    disableNavigation: true, // Paywall is rendered inline, don't navigate
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

  // 1. Loading / Initialization View
  if (status === SubscriptionFlowStatus.INITIALIZING || !islocalizationReady) {
    if (__DEV__) {
       console.log('[ManagedSubscriptionFlow] ⏳ Rendering Initialization state', {
         status,
         islocalizationReady,
         hasSplashConfig: !!splash,
         isSplashComplete
       });
    }

    // Even if no splash config provided, we should show a basic splash to avoid white screen
    return (
      <SplashScreen
        appName={splash?.appName || "Loading..."}
        tagline={splash?.tagline || "Please wait while we set things up"}
        colors={tokens.colors}
      />
    );
  }

  if (__DEV__) {
    console.log('[ManagedSubscriptionFlow] 🔄 Rendering Main state', {
      status,
      isSplashComplete,
      islocalizationReady,
      showFeedback: flowState.showFeedback
    });
  }

  // 2. Onboarding View
  if (status === SubscriptionFlowStatus.ONBOARDING) {
    return (
      <OnboardingScreen
        slides={onboarding.slides}
        onComplete={completeOnboarding}
        showSkipButton={onboarding.showSkipButton ?? true}
        showBackButton={onboarding.showBackButton ?? true}
        showProgressBar={onboarding.showProgressBar ?? true}
        themeColors={onboarding.themeColors}
        translations={onboarding.translations}
      />
    );
  }

  // 2.5. Post-Onboarding Paywall View
  if (status === SubscriptionFlowStatus.POST_ONBOARDING_PAYWALL) {
    if (__DEV__) {
      console.log('[ManagedSubscriptionFlow] 💳 Rendering Post-Onboarding Paywall', {
        hasPackages: flowState.showPostOnboardingPaywall
      });
    }

    return (
      <PaywallScreen
        translations={paywall.translations}
        legalUrls={paywall.legalUrls}
        features={paywall.features}
        bestValueIdentifier={paywall.bestValueIdentifier}
        creditsLabel={paywall.creditsLabel}
        heroImage={paywall.heroImage}
        source="onboarding"
        packages={packages}
        isPremium={isPremium}
        credits={credits}
        isSyncing={isSyncing}
        onPurchase={purchasePackage}
        onRestore={restorePurchase}
        onClose={handleClose}
      />
    );
  }

  // 3. Application Content + Overlays
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
});

export const ManagedSubscriptionFlow: React.FC<ManagedSubscriptionFlowProps> = (props) => {
  return (
    <SubscriptionFlowProvider>
      <ManagedSubscriptionFlowInner {...props} />
    </SubscriptionFlowProvider>
  );
};
