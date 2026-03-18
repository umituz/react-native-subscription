/**
 * State Components for ManagedSubscriptionFlow
 * Separated for better maintainability
 */

import React from "react";
import type { PurchasesPackage } from "react-native-purchases";
import type { UserCredits } from "../../../credits/core/Credits";
import { SplashScreen } from "@umituz/react-native-design-system/molecules";
import { OnboardingScreen } from "@umituz/react-native-design-system/onboarding";
import type { ManagedSubscriptionFlowProps } from "./ManagedSubscriptionFlow";
import { PaywallScreen } from "../../../paywall/components/PaywallScreen";
import { PaywallFeedbackScreen } from "./feedback/PaywallFeedbackScreen";
import { usePaywallFeedbackSubmit } from "../../../../presentation/hooks/feedback/useFeedbackSubmit";

// ============================================================================
// INITIALIZING STATE
// ============================================================================

interface InitializingStateProps {
  tokens: any;
  splash?: ManagedSubscriptionFlowProps["splash"];
}

export const InitializingState: React.FC<InitializingStateProps> = ({ tokens, splash }) => (
  <SplashScreen
    appName={splash?.appName || "Loading..."}
    tagline={splash?.tagline || "Please wait while we set things up"}
    colors={tokens.colors}
  />
);

// ============================================================================
// ONBOARDING STATE
// ============================================================================

interface OnboardingStateProps {
  config: ManagedSubscriptionFlowProps["onboarding"];
  onComplete: () => void;
}

export const OnboardingState: React.FC<OnboardingStateProps> = ({ config, onComplete }) => (
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

// ============================================================================
// PAYWALL STATE
// ============================================================================

interface PaywallStateProps {
  config: ManagedSubscriptionFlowProps["paywall"];
  packages: PurchasesPackage[];
  isPremium: boolean;
  credits: UserCredits | null;
  isSyncing: boolean;
  onPurchase: (pkg: PurchasesPackage) => Promise<boolean>;
  onRestore: () => Promise<boolean>;
  onClose: (purchased: boolean) => void;
}

export const PaywallState: React.FC<PaywallStateProps> = ({
  config,
  packages,
  isPremium,
  credits,
  isSyncing,
  onPurchase,
  onRestore,
  onClose,
}) => {
  const [purchaseSuccessful, setPurchaseSuccessful] = React.useState(false);

  const handlePurchase = async (pkg: PurchasesPackage) => {
    const result = await onPurchase(pkg);
    if (result) {
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

// ============================================================================
// FEEDBACK STATE
// ============================================================================

interface FeedbackStateProps {
  config: ManagedSubscriptionFlowProps["feedback"];
  onClose: () => void;
}

export const FeedbackState: React.FC<FeedbackStateProps> = ({ config, onClose }) => {
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
// READY STATE (APP CONTENT)
// ============================================================================

interface ReadyStateProps {
  children: React.ReactNode;
  offline?: ManagedSubscriptionFlowProps["offline"];
  feedbackConfig: ManagedSubscriptionFlowProps["feedback"];
  showFeedback: boolean;
  tokens: any;
  onFeedbackClose: () => void;
}

export const ReadyState: React.FC<ReadyStateProps> = ({
  children,
  offline,
  feedbackConfig,
  showFeedback,
  tokens,
  onFeedbackClose,
}) => {
  const { OfflineBanner } = require("@umituz/react-native-design-system/offline");

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
          config={feedbackConfig}
          onClose={onFeedbackClose}
        />
      )}
    </>
  );
};
