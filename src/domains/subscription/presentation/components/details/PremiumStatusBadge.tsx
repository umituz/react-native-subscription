/**
 * Premium Status Badge
 * Displays subscription status as a colored badge
 */

import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { AtomicText } from "@umituz/react-native-design-system/atoms";
import { useAppDesignTokens } from "@umituz/react-native-design-system/theme";
import { SUBSCRIPTION_STATUS } from "../../../core/SubscriptionConstants";
import type { PremiumStatusBadgeProps } from "./PremiumStatusBadge.types";
import type { SubscriptionStatusType } from "../../../core/SubscriptionConstants";

export type { PremiumStatusBadgeProps };

export const PremiumStatusBadge: React.FC<PremiumStatusBadgeProps> = React.memo(({
  status,
  activeLabel,
  expiredLabel,
  noneLabel,
  canceledLabel,
}) => {
  const tokens = useAppDesignTokens();

  const labels: Record<SubscriptionStatusType, string> = useMemo(() => ({
    [SUBSCRIPTION_STATUS.ACTIVE]: activeLabel,
    [SUBSCRIPTION_STATUS.EXPIRED]: expiredLabel,
    [SUBSCRIPTION_STATUS.NONE]: noneLabel,
    [SUBSCRIPTION_STATUS.CANCELED]: canceledLabel,
  }), [activeLabel, canceledLabel, expiredLabel, noneLabel]);

  const backgroundColor = useMemo(() => {
    const colors: Record<SubscriptionStatusType, string> = {
      [SUBSCRIPTION_STATUS.ACTIVE]: tokens.colors.success,
      [SUBSCRIPTION_STATUS.EXPIRED]: tokens.colors.error,
      [SUBSCRIPTION_STATUS.NONE]: tokens.colors.textTertiary,
      [SUBSCRIPTION_STATUS.CANCELED]: tokens.colors.warning,
    };
    return colors[status];
  }, [status, tokens.colors]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        badge: {
          paddingHorizontal: tokens.spacing.md,
          paddingVertical: tokens.spacing.xs,
          borderRadius: tokens.radius.full,
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
});
