/**
 * Credit Row Component
 * Displays credit information with progress bar
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import { useAppDesignTokens, AtomicText } from "@umituz/react-native-design-system";

export interface CreditRowProps {
  label: string;
  current: number;
  total: number;
  remainingLabel?: string;
}

export const CreditRow: React.FC<CreditRowProps> = ({
  label,
  current,
  total,
  remainingLabel,
}) => {
  const tokens = useAppDesignTokens();
  const percentage = total > 0 ? (current / total) * 100 : 0;
  const isLow = percentage <= 20;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AtomicText type="bodySmall" style={{ color: tokens.colors.textPrimary }}>
          {label}
        </AtomicText>
        <AtomicText
          type="bodySmall"
          style={{
            color: isLow ? tokens.colors.warning : tokens.colors.textSecondary,
          }}
        >
          {current} / {total} {remainingLabel}
        </AtomicText>
      </View>
      <View
        style={[styles.progressBar, { backgroundColor: tokens.colors.surfaceSecondary }]}
      >
        <View
          style={[
            styles.progressFill,
            {
              width: `${percentage}%`,
              backgroundColor: isLow ? tokens.colors.warning : tokens.colors.primary,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
});
