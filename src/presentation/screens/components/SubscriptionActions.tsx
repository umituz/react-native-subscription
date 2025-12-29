/**
 * Subscription Actions Component
 * Displays upgrade button for non-premium users
 */

import React, { useMemo } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useAppDesignTokens, AtomicText } from "@umituz/react-native-design-system";
import type { SubscriptionActionsProps } from "../../types/SubscriptionDetailTypes";

export const SubscriptionActions: React.FC<SubscriptionActionsProps> = ({
  isPremium,
  upgradeButtonLabel,
  onUpgrade,
}) => {
  const tokens = useAppDesignTokens();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          paddingBottom: tokens.spacing.xl,
        },
        primaryButton: {
          paddingVertical: tokens.spacing.md,
          borderRadius: tokens.borderRadius.lg,
          alignItems: "center",
          backgroundColor: tokens.colors.primary,
        },
        buttonText: {
          color: tokens.colors.onPrimary,
          fontWeight: "700",
        },
      }),
    [tokens]
  );

  if (isPremium || !onUpgrade || !upgradeButtonLabel) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.primaryButton} onPress={onUpgrade}>
        <AtomicText type="titleMedium" style={styles.buttonText}>
          {upgradeButtonLabel}
        </AtomicText>
      </TouchableOpacity>
    </View>
  );
};
