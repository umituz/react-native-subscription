/**
 * Onboarding State Component
 *
 * Displays onboarding slides to the user.
 */

import React from "react";
import { OnboardingScreen } from "@umituz/react-native-design-system/onboarding";
import type { ManagedSubscriptionFlowProps } from "../ManagedSubscriptionFlow.types";

interface OnboardingStateProps {
  config: ManagedSubscriptionFlowProps["onboarding"];
  onComplete: () => void;
}

export const OnboardingState: React.FC<OnboardingStateProps> = ({ config, onComplete }) => {
  return (
    <OnboardingScreen
      slides={config.slides}
      translations={config.translations}
      onComplete={onComplete}
      showSkipButton={config.showSkipButton ?? true}
      showBackButton={config.showBackButton ?? true}
      showProgressBar={config.showProgressBar ?? true}
    />
  );
};
