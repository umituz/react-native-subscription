/**
 * Credit Item Component
 * Displays individual credit usage with progress bar
 */

import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { useAppDesignTokens, AtomicText } from "@umituz/react-native-design-system";
import type { CreditItemProps } from "../../types/SubscriptionDetailTypes";

export const CreditItem: React.FC<CreditItemProps> = ({
  label,
  current,
  total,
  remainingLabel,
}) => {
  const tokens = useAppDesignTokens();
  const percentage = total > 0 ? (current / total) * 100 : 0;
  const isLow = percentage <= 20;
  const isMedium = percentage > 20 && percentage <= 50;

  const progressColor = useMemo(() => {
    if (isLow) return tokens.colors.error;
    if (isMedium) return tokens.colors.warning;
    return tokens.colors.success;
  }, [isLow, isMedium, tokens.colors]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          gap: tokens.spacing.sm,
        },
        header: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        },
        label: {
          fontWeight: "500",
        },
        badge: {
          paddingHorizontal: tokens.spacing.md,
          paddingVertical: tokens.spacing.xs,
          borderRadius: tokens.borderRadius.md,
          backgroundColor: tokens.colors.surfaceSecondary,
        },
        count: {
          fontWeight: "600",
        },
        progressBar: {
          height: 8,
          borderRadius: tokens.borderRadius.xs,
          overflow: "hidden",
          backgroundColor: tokens.colors.surfaceSecondary,
        },
        progressFill: {
          height: "100%",
          borderRadius: tokens.borderRadius.xs,
          width: `${percentage}%`,
          backgroundColor: progressColor,
        },
      }),
    [tokens, percentage, progressColor]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AtomicText
          type="bodyMedium"
          style={[styles.label, { color: tokens.colors.textPrimary }]}
        >
          {label}
        </AtomicText>
        <View style={styles.badge}>
          <AtomicText
            type="labelSmall"
            style={[styles.count, { color: progressColor }]}
          >
            {current} / {total}
          </AtomicText>
        </View>
      </View>
      <View style={styles.progressBar}>
        <View style={styles.progressFill} />
      </View>
      {remainingLabel && (
        <AtomicText type="bodySmall" style={{ color: tokens.colors.textSecondary }}>
          {current} {remainingLabel}
        </AtomicText>
      )}
    </View>
  );
};
