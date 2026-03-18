/**
 * ManagedSubscriptionFlow
 *
 * State machine-based flow orchestration.
 * No complex if/else - clean state transitions.
 */

import React, { useEffect, useCallback } from "react";
import type { NavigationProp } from "@react-navigation/native";
import type { ImageSourcePropType } from "react-native";
import { View } from "react-native";
import { SplashScreen, useSplashFlow } from "@umituz/react-native-design-system/molecules";
import { OnboardingScreen } from "@umituz/react-native-design-system/onboarding";
import { OfflineBanner } from "@umituz/react-native-design-system/offline";
import { useAppDesignTokens } from "@umituz/react-native-design-system/theme";
import { usePremiumStatus } from "../../presentation/usePremiumStatus";
import { usePremiumPackages } from "../../presentation/usePremiumPackages";
import { usePremiumActions } from "../../presentation/usePremiumActions";
import { useSubscriptionFlowStore, SubscriptionFlowStatus } from "../useSubscriptionFlow";
import { PaywallFeedbackScreen } from "./feedback/PaywallFeedbackScreen";
import type { PaywallFeedbackTranslations } from "./feedback/PaywallFeedbackScreen.types";
import type { PaywallTranslations, PaywallLegalUrls, SubscriptionFeature } from "../../../paywall/entities/types";
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

import {
  SubscriptionFlowProvider,
  useSubscriptionFlowStatus
} from "../providers/SubscriptionFlowProvider";

// ============================================================================
// STATE MACHINE COMPONENTS
// ============================================================================

interface StateComponentProps {
  status: SubscriptionFlowStatus;
  tokens: any;
  onboardingConfig: ManagedSubscriptionFlowProps["onboarding"];
  paywallConfig: ManagedSubscriptionFlowProps["paywall"];
  feedbackConfig: ManagedSubscriptionFlowProps["feedback"];
  isPremium: boolean;
  packages: any[];
  credits: number | null;
  isSyncing: boolean;
  onPurchasePackage: (pkgId: string) => Promise<any>;
  onRestorePurchase: () => Promise<any>;
  navigation: NavigationProp<any>;
}

const InitializingState: React.FC<{ tokens: any; splash?: ManagedSubscriptionFlowProps["splash"] }> = ({ tokens, splash }) => (
  <SplashScreen
    appName={splash?.appName || "Loading..."}
    tagline={splash?.tagline || "Please wait while we set things up"}
    colors={tokens.colors}
  />
);

const OnboardingState: React.FC<{
  config: ManagedSubscriptionFlowProps["onboarding"];
  onComplete: () => void;
}> = ({ config, onComplete }) => (
  <OnboardingScreen
    slides={config.slides}
    onComplete={onComplete}
    showSkipButton={config.showSkipButton ?? true}
    showBackButton={config.showBackButton ?? true}
    showProgressBar={config.showProgressBar ?? true}
    themeColors={config.themeColors}
    translations={config.translations}
  />
);

const PaywallState: React.FC<{
  config: ManagedSubscriptionFlowProps["paywall"];
  packages: any[];
  isPremium: boolean;
  credits: number | null;
  isSyncing: boolean;
  onPurchase: (pkgId: string) => Promise<any>;
  onRestore: () => Promise<any>;
  onClose: (purchased: boolean) => void;
}> = ({ config, packages, isPremium, credits, isSyncing, onPurchase, onRestore, onClose }) => {
  const [purchaseSuccessful, setPurchaseSuccessful] = React.useState(false);

  const handlePurchase = async (pkgId: string) => {
    const result = await onPurchase(pkgId);
    if (result?.success) {
      setPurchaseSuccessful(true);
    }
    return result;
  };

  const handleClose = () => {
    onClose(purchaseSuccessful);
  };

  return (
    <PaywallScreen
      translations={config.translations}
      legalUrls={config.legalUrls}
      features={config.features}
      bestValueIdentifier={config.bestValueIdentifier}
      creditsLabel={config.creditsLabel}
      heroImage={config.heroImage}
      source="onboarding"
      packages={packages}
      isPremium={isPremium}
      credits={credits}
      isSyncing={isSyncing}
      onPurchase={handlePurchase}
      onRestore={onRestore}
      onClose={handleClose}
    />
  );
};

const FeedbackState: React.FC<{
  config: ManagedSubscriptionFlowProps["feedback"];
  onClose: () => void;
}> = ({ config, onClose }) => {
  const { submit: internalSubmit } = usePaywallFeedbackSubmit();

  const handleSubmit = async (data: { reason: string; otherText?: string }) => {
    if (config.onSubmit) {
      await config.onSubmit(data);
    } else {
      const description = data.otherText ? `${data.reason}: ${data.otherText}` : data.reason;
      await internalSubmit(description);
    }
  };

  return (
    <PaywallFeedbackScreen
      onClose={onClose}
      onSubmit={handleSubmit}
      translations={config.translations}
    />
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

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

  // Premium hooks
  const { isPremium, isSyncing, credits, isLoading: isPremiumLoading } = usePremiumStatus();
  const { packages } = usePremiumPackages();
  const { purchasePackage, restorePurchase } = usePremiumActions();

  // Store actions
  const completeOnboarding = useSubscriptionFlowStore((s) => s.completeOnboarding);
  const showPaywall = useSubscriptionFlowStore((s) => s.showPaywall);
  const completePaywall = useSubscriptionFlowStore((s) => s.completePaywall);
  const hideFeedback = useSubscriptionFlowStore((s) => s.hideFeedback);
  const showFeedbackScreen = useSubscriptionFlowStore((s) => s.showFeedbackScreen);

  const showFeedback = useSubscriptionFlowStore((s) => s.showFeedback);

  // ========================================================================
  // STATE TRANSITIONS
  // ========================================================================

  // CHECK_PREMIUM state transition logic
  useEffect(() => {
    if (status === SubscriptionFlowStatus.CHECK_PREMIUM && !isPremiumLoading) {
      const paywallShown = useSubscriptionFlowStore.getState().paywallShown;

      if (isPremium) {
        // User is premium, go to ready
        completePaywall(true);
      } else if (!paywallShown) {
        // User not premium and paywall not shown, show paywall
        showPaywall();
      } else {
        // Paywall already shown, go to ready
        completePaywall(false);
      }
    }
  }, [status, isPremium, isPremiumLoading, showPaywall, completePaywall]);

  // Show feedback when needed
  useEffect(() => {
    if (status === SubscriptionFlowStatus.READY && showFeedback) {
      showFeedbackScreen();
    }
  }, [status, showFeedback, showFeedbackScreen]);

  // ========================================================================
  // RENDER
  // ========================================================================

  // Wait for localization
  if (!islocalizationReady || status === SubscriptionFlowStatus.INITIALIZING) {
    return <InitializingState tokens={tokens} splash={splash} />;
  }

  // Render by state
  switch (status) {
    case SubscriptionFlowStatus.ONBOARDING:
      return <OnboardingState config={onboarding} onComplete={completeOnboarding} />;

    case SubscriptionFlowStatus.CHECK_PREMIUM:
      // Show loading while checking premium
      return <InitializingState tokens={tokens} splash={splash} />;

    case SubscriptionFlowStatus.POST_ONBOARDING_PAYWALL:
      return (
        <PaywallState
          config={paywall}
          packages={packages}
          isPremium={isPremium}
          credits={credits}
          isSyncing={isSyncing}
          onPurchase={purchasePackage}
          onRestore={restorePurchase}
          onClose={(purchased) => completePaywall(purchased)}
        />
      );

    case SubscriptionFlowStatus.READY:
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

          {showFeedback && (
            <FeedbackState
              config={feedback}
              onClose={hideFeedback}
            />
          )}
        </>
      );

    default:
      return <InitializingState tokens={tokens} splash={splash} />;
  }
});

ManagedSubscriptionFlowInner.displayName = "ManagedSubscriptionFlowInner";

export const ManagedSubscriptionFlow: React.FC<ManagedSubscriptionFlowProps> = (props) => {
  return (
    <SubscriptionFlowProvider>
      <ManagedSubscriptionFlowInner {...props} />
    </SubscriptionFlowProvider>
  );
};
