/**
 * Premium Status Badge
 * Displays subscription status as a colored badge
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import { useAppDesignTokens, AtomicText } from "@umituz/react-native-design-system";
import { SubscriptionStatusType } from "@domain/entities/SubscriptionStatus";
export type { SubscriptionStatusType };

export interface PremiumStatusBadgeProps {
  status: SubscriptionStatusType;
  activeLabel: string;
  expiredLabel: string;
  noneLabel: string;
  canceledLabel: string;
}

/**
 * Badge component showing subscription status
 */
export const PremiumStatusBadge: React.FC<PremiumStatusBadgeProps> = ({
  status,
  activeLabel,
  expiredLabel,
  noneLabel,
  canceledLabel,
}) => {
  const tokens = useAppDesignTokens();

  const labels: Record<SubscriptionStatusType, string> = {
    active: activeLabel,
    expired: expiredLabel,
    none: noneLabel,
    canceled: canceledLabel,
  };

  const colors: Record<SubscriptionStatusType, string> = {
    active: tokens.colors.success,
    expired: tokens.colors.error,
    none: tokens.colors.textTertiary,
    canceled: tokens.colors.warning,
  };

  const backgroundColor = colors[status];
  const label = labels[status];

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <AtomicText type="labelSmall" style={[styles.badgeText, { color: tokens.colors.onPrimary }]}>
        {label}
      </AtomicText>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontWeight: "600",
  },
});
