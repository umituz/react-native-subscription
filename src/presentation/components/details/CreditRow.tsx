import React, { useMemo } from "react";
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
  
  // Progress color based on percentage
  const progressColor = useMemo(() => {
    if (percentage <= 20) return tokens.colors.error;
    if (percentage <= 50) return tokens.colors.warning;
    return tokens.colors.success;
  }, [percentage, tokens.colors]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AtomicText type="bodyMedium" style={[styles.label, { color: tokens.colors.textPrimary }]}>
          {label}
        </AtomicText>
        <View style={[styles.badge, { backgroundColor: tokens.colors.surfaceSecondary }]}>
          <AtomicText type="labelSmall" style={[styles.count, { color: progressColor }]}>
            {current} / {total}
          </AtomicText>
        </View>
      </View>
      <View style={[styles.progressBar, { backgroundColor: tokens.colors.surfaceSecondary }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${percentage}%`,
              backgroundColor: progressColor,
            },
          ]}
        />
      </View>
      {remainingLabel && (
        <AtomicText type="bodySmall" style={{ color: tokens.colors.textSecondary }}>
          {current} {remainingLabel}
        </AtomicText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
    marginVertical: 4,
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
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  count: {
    fontWeight: "600",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
});

