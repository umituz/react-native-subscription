/**
 * Subscription Section for Settings Screen
 * Generic component that renders subscription/premium details
 * App passes all data via config props (credits, translations, handlers)
 */

import React from "react";
import { View, TouchableOpacity } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import {
  PremiumDetailsCard,
  type CreditInfo,
  type PremiumDetailsTranslations,
} from "../details/PremiumDetailsCard";
import type { SubscriptionStatusType } from "../details/PremiumStatusBadge";

export interface SubscriptionSectionConfig {
  /** Subscription status type */
  statusType: SubscriptionStatusType;
  /** Whether user has premium */
  isPremium: boolean;
  /** Formatted expiration date string */
  expirationDate?: string | null;
  /** Formatted purchase date string */
  purchaseDate?: string | null;
  /** Whether subscription is lifetime */
  isLifetime?: boolean;
  /** Days remaining until expiration */
  daysRemaining?: number | null;
  /** Credit info array (app-specific, passed from app) */
  credits?: CreditInfo[];
  /** All translations (app must provide these) */
  translations: PremiumDetailsTranslations;
  /** Handler for manage subscription button */
  onManageSubscription?: () => void;
  /** Handler for upgrade button */
  onUpgrade?: () => void;
  /** Handler for when section is tapped (navigate to detail screen) */
  onPress?: () => void;
}

export interface SubscriptionSectionProps {
  config: SubscriptionSectionConfig;
  containerStyle?: StyleProp<ViewStyle>;
}

export const SubscriptionSection: React.FC<SubscriptionSectionProps> = ({
  config,
  containerStyle,
}) => {
  const content = (
    <PremiumDetailsCard
      statusType={config.statusType}
      isPremium={config.isPremium}
      expirationDate={config.expirationDate}
      purchaseDate={config.purchaseDate}
      isLifetime={config.isLifetime}
      daysRemaining={config.daysRemaining}
      credits={config.credits}
      translations={config.translations}
      onManageSubscription={config.onManageSubscription}
      onUpgrade={config.onUpgrade}
    />
  );

  if (config.onPress) {
    return (
      <TouchableOpacity
        style={containerStyle}
        onPress={config.onPress}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle}>{content}</View>;
};
