/**
 * Subscription Section for Settings Screen
 * Generic component that renders subscription/premium details
 * App passes all data via config props (credits, translations, handlers)
 */

import React from "react";
import { View, TouchableOpacity } from "react-native";
import { PremiumDetailsCard } from "../details/PremiumDetailsCard";
import type { SubscriptionSectionConfig, SubscriptionSectionProps } from "./SubscriptionSection.types";

export type { SubscriptionSectionConfig, SubscriptionSectionProps };

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
