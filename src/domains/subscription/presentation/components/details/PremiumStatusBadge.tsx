/**
 * Premium Status Badge
 * Displays subscription status as a colored badge
 */

import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { useAppDesignTokens, AtomicText } from "@umituz/react-native-design-system";
import {
  SUBSCRIPTION_STATUS,
  type SubscriptionStatusType
} from "../../../core/SubscriptionConstants";

export type { SubscriptionStatusType };

export interface PremiumStatusBadgeProps {
  status: SubscriptionStatusType;
  activeLabel: string;
  expiredLabel: string;
  noneLabel: string;
  canceledLabel: string;
  /** Label for trial_canceled status (defaults to canceledLabel if not provided) */
  trialCanceledLabel?: string;
}

export const PremiumStatusBadge: React.FC<PremiumStatusBadgeProps> = ({
  status,
  activeLabel,
  expiredLabel,
  noneLabel,
  canceledLabel,
  trialCanceledLabel,
}) => {
  const tokens = useAppDesignTokens();

  const labels: Record<SubscriptionStatusType, string> = useMemo(() => ({
    [SUBSCRIPTION_STATUS.ACTIVE]: activeLabel,
    [SUBSCRIPTION_STATUS.TRIAL]: activeLabel,
    [SUBSCRIPTION_STATUS.TRIAL_CANCELED]: trialCanceledLabel ?? canceledLabel,
    [SUBSCRIPTION_STATUS.EXPIRED]: expiredLabel,
    [SUBSCRIPTION_STATUS.NONE]: noneLabel,
    [SUBSCRIPTION_STATUS.CANCELED]: canceledLabel,
  }), [activeLabel, trialCanceledLabel, canceledLabel, expiredLabel, noneLabel]);

  const backgroundColor = useMemo(() => {
    const colors: Record<SubscriptionStatusType, string> = {
      [SUBSCRIPTION_STATUS.ACTIVE]: tokens.colors.success,
      [SUBSCRIPTION_STATUS.TRIAL]: tokens.colors.primary, // Blue/purple for trial
      [SUBSCRIPTION_STATUS.TRIAL_CANCELED]: tokens.colors.warning, // Orange for trial canceled
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
