/**
 * Upgrade Prompt Component
 * Displays premium benefits for free users to encourage upgrade
 */

import React, { useMemo } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import {
    useAppDesignTokens,
    AtomicText,
    AtomicIcon,
} from "@umituz/react-native-design-system";
import type { UpgradePromptProps } from "../../types/SubscriptionDetailTypes";

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  title,
  subtitle,
  benefits,
  upgradeButtonLabel,
  onUpgrade,
}) => {
  const tokens = useAppDesignTokens();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          gap: tokens.spacing.lg,
        },
        header: {
          alignItems: "center",
          gap: tokens.spacing.md,
          paddingVertical: tokens.spacing.md,
        },
        iconContainer: {
          width: 64,
          height: 64,
          borderRadius: 32,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: tokens.colors.primaryContainer,
        },
        title: {
          fontWeight: "700",
          textAlign: "center",
        },
        subtitle: {
          textAlign: "center",
          lineHeight: 22,
        },
        benefitsCard: {
          borderRadius: tokens.radius.lg,
          padding: tokens.spacing.lg,
          gap: tokens.spacing.md,
          backgroundColor: tokens.colors.surface,
        },
        benefitItem: {
          flexDirection: "row",
          alignItems: "center",
          gap: tokens.spacing.md,
        },
        benefitIconWrapper: {
          width: 32,
          height: 32,
          borderRadius: 16,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: tokens.colors.primaryContainer,
        },
        benefitText: {
          flex: 1,
        },
        upgradeButton: {
          paddingVertical: tokens.spacing.lg,
          borderRadius: tokens.radius.lg,
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <AtomicIcon name="sparkles" customSize={32} color="primary" />
        </View>
        <AtomicText
          type="headlineSmall"
          style={[styles.title, { color: tokens.colors.textPrimary }]}
        >
          {title}
        </AtomicText>
        {subtitle && (
          <AtomicText
            type="bodyMedium"
            style={[styles.subtitle, { color: tokens.colors.textSecondary }]}
          >
            {subtitle}
          </AtomicText>
        )}
      </View>

      {benefits && benefits.length > 0 && (
        <View style={styles.benefitsCard}>
          {benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <View style={styles.benefitIconWrapper}>
                <AtomicIcon
                  name={benefit.icon || "checkmark-circle-outline"}
                  customSize={16}
                  color="primary"
                />
              </View>
              <AtomicText
                type="bodyMedium"
                style={[styles.benefitText, { color: tokens.colors.textPrimary }]}
              >
                {benefit.text}
              </AtomicText>
            </View>
          ))}
        </View>
      )}

      {onUpgrade && upgradeButtonLabel && (
        <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
          <AtomicText type="titleMedium" style={styles.buttonText}>
            {upgradeButtonLabel}
          </AtomicText>
        </TouchableOpacity>
      )}
    </View>
  );
};
