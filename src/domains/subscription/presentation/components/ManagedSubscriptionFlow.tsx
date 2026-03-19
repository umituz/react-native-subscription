/**
 * ManagedSubscriptionFlow
 *
 * Clean state machine-based flow orchestration.
 * State components and logic separated to individual modules.
 */

import React from "react";
import { useAppDesignTokens } from "@umituz/react-native-design-system/theme";
import { usePremiumStatus } from "../../presentation/usePremiumStatus";
import { usePremiumPackages } from "../../presentation/usePremiumPackages";
import { usePremiumActions } from "../../presentation/usePremiumActions";
import { useSubscriptionFlowStore, SubscriptionFlowStatus } from "../useSubscriptionFlow";
import { useStateTransitions } from "./ManagedSubscriptionFlow.logic";
import type { ManagedSubscriptionFlowProps } from "./ManagedSubscriptionFlow.types";
import { InitializingState } from "./states/InitializingState";
import { OnboardingState } from "./states/OnboardingState";
import { PaywallState } from "./states/PaywallState";
import { ReadyState } from "./states/ReadyState";
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
  const completePaywall = useSubscriptionFlowStore((s) => s.completePaywall);
  const hideFeedback = useSubscriptionFlowStore((s) => s.hideFeedback);
  const showFeedback = useSubscriptionFlowStore((s) => s.showFeedback);

  // State transitions
  useStateTransitions({
    status,
    isPremium,
    isSyncing,
    showFeedback,
  });

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
