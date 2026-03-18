/**
 * ManagedSubscriptionFlow
 *
 * Clean state machine-based flow orchestration.
 * All state components separated to individual files.
 */

import React, { useEffect } from "react";
import type { NavigationProp } from "@react-navigation/native";
import type { ImageSourcePropType } from "react-native";
import { useAppDesignTokens } from "@umituz/react-native-design-system/theme";
import { usePremiumStatus } from "../../presentation/usePremiumStatus";
import { usePremiumPackages } from "../../presentation/usePremiumPackages";
import { usePremiumActions } from "../../presentation/usePremiumActions";
import { useSubscriptionFlowStore, SubscriptionFlowStatus } from "../useSubscriptionFlow";
import type { PaywallFeedbackTranslations } from "./feedback/PaywallFeedbackScreen.types";
import type { PaywallTranslations, PaywallLegalUrls, SubscriptionFeature } from "../../../paywall/entities/types";
import {
  InitializingState,
  OnboardingState,
  PaywallState,
  ReadyState,
} from "./ManagedSubscriptionFlow.states";

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

const ManagedSubscriptionFlowInner: React.FC<ManagedSubscriptionFlowProps> = ({
  children,
  islocalizationReady,
  splash,
  onboarding,
  paywall,
  feedback,
  offline,
}) => {
  const tokens = useAppDesignTokens();
  const status = useSubscriptionFlowStatus();

  // Premium hooks
  const { isPremium, isSyncing, credits } = usePremiumStatus();
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

  useEffect(() => {
    if (status === SubscriptionFlowStatus.CHECK_PREMIUM && !isSyncing) {
      const paywallShown = useSubscriptionFlowStore.getState().paywallShown;

      if (isPremium) {
        completePaywall(true);
      } else if (!paywallShown) {
        showPaywall();
      } else {
        completePaywall(false);
      }
    }
  }, [status, isPremium, isSyncing, showPaywall, completePaywall]);

  useEffect(() => {
    if (status === SubscriptionFlowStatus.READY && showFeedback) {
      showFeedbackScreen();
    }
  }, [status, showFeedback, showFeedbackScreen]);

  // ========================================================================
  // RENDER BY STATE
  // ========================================================================

  if (!islocalizationReady || status === SubscriptionFlowStatus.INITIALIZING) {
    return <InitializingState tokens={tokens} splash={splash} />;
  }

  switch (status) {
    case SubscriptionFlowStatus.ONBOARDING:
      return <OnboardingState config={onboarding} onComplete={completeOnboarding} />;

    case SubscriptionFlowStatus.CHECK_PREMIUM:
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
        <ReadyState
          children={children}
          offline={offline}
          feedbackConfig={feedback}
          showFeedback={showFeedback}
          tokens={tokens}
          onFeedbackClose={hideFeedback}
        />
      );

    default:
      return <InitializingState tokens={tokens} splash={splash} />;
  }
};

ManagedSubscriptionFlowInner.displayName = "ManagedSubscriptionFlowInner";

export const ManagedSubscriptionFlow: React.FC<ManagedSubscriptionFlowProps> = (props) => {
  return (
    <SubscriptionFlowProvider>
      <ManagedSubscriptionFlowInner {...props} />
    </SubscriptionFlowProvider>
  );
};
