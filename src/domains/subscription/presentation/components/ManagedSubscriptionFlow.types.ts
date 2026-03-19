/**
 * ManagedSubscriptionFlow Types
 */

import type { NavigationProp } from "@react-navigation/native";
import type { ImageSourcePropType } from "react-native";
import type { PaywallFeedbackTranslations } from "./feedback/PaywallFeedbackScreen.types";
import type { PaywallTranslations, PaywallLegalUrls, SubscriptionFeature } from "../../../paywall/entities/types";

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
