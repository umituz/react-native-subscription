/**
 * Premium Status Badge
 * Displays subscription status as a colored badge
 */

import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { useAppDesignTokens, AtomicText } from "@umituz/react-native-design-system";
import type { SubscriptionStatusType } from "../../../domain/entities/SubscriptionStatus";

export type { SubscriptionStatusType };

export interface PremiumStatusBadgeProps {
  status: SubscriptionStatusType;
  activeLabel: string;
  expiredLabel: string;
  noneLabel: string;
  canceledLabel: string;
}

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

  const backgroundColor = useMemo(() => {
    const colors: Record<SubscriptionStatusType, string> = {
      active: tokens.colors.success,
      expired: tokens.colors.error,
      none: tokens.colors.textTertiary,
      canceled: tokens.colors.warning,
    };
    return colors[status];
  }, [status, tokens.colors]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        badge: {
          paddingHorizontal: tokens.spacing.sm,
          paddingVertical: tokens.spacing.xs,
          borderRadius: tokens.radius.xs,
          backgroundColor,
        },
        badgeText: {
          fontWeight: "600",
          color: tokens.colors.onPrimary,
        },
      }),
    [tokens, backgroundColor]
  );

  return (
    <View style={styles.badge}>
      <AtomicText type="labelSmall" style={styles.badgeText}>
        {labels[status]}
      </AtomicText>
    </View>
  );
};
