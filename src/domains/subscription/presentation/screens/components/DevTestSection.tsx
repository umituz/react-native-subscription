/**
 * Dev Test Section
 * Developer testing tools for subscription renewals
 * Only visible in __DEV__ mode
 */

import React, { useMemo } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { AtomicText, useAppDesignTokens } from "@umituz/react-native-design-system";
import type { DevTestSectionProps } from "../../types/SubscriptionDetailTypes";

export type { DevTestActions, DevTestSectionProps } from "../../types/SubscriptionDetailTypes";

/** Dev test button translations */
export interface DevTestTranslations {
  title: string;
  testRenewal: string;
  checkCredits: string;
  testDuplicate: string;
}

export interface DevTestSectionWithTranslationsProps extends DevTestSectionProps {
  translations?: DevTestTranslations;
}

export const DevTestSection: React.FC<DevTestSectionWithTranslationsProps> = ({
  actions,
  title,
  translations,
}) => {
  const tokens = useAppDesignTokens();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          padding: tokens.spacing.lg,
          gap: tokens.spacing.md,
          borderTopWidth: 1,
          backgroundColor: tokens.colors.surfaceSecondary,
          borderTopColor: tokens.colors.border,
        },
        title: {
          fontWeight: "600",
          marginBottom: tokens.spacing.xs,
        },
        button: {
          paddingVertical: tokens.spacing.md,
          paddingHorizontal: tokens.spacing.lg,
          borderRadius: tokens.radius.md,
          alignItems: "center",
        },
        primaryButton: {
          backgroundColor: tokens.colors.primary,
        },
        secondaryButton: {
          backgroundColor: tokens.colors.surfaceSecondary,
          borderWidth: 1,
          borderColor: tokens.colors.border,
        },
        buttonText: {
          fontWeight: "500",
        },
      }),
    [tokens]
  );

  if (!__DEV__) {
    return null;
  }

  const displayTitle = title || translations?.title;
  const renewalText = translations?.testRenewal || "Test Auto-Renewal";
  const creditsText = translations?.checkCredits || "Check Credits";
  const duplicateText = translations?.testDuplicate || "Test Duplicate Protection";

  return (
    <View style={styles.container}>
      {displayTitle && (
        <AtomicText
          type="titleMedium"
          style={[styles.title, { color: tokens.colors.textPrimary }]}
        >
          {displayTitle}
        </AtomicText>
      )}

      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={actions.onTestRenewal}
      >
        <AtomicText
          type="bodyMedium"
          style={[styles.buttonText, { color: tokens.colors.onPrimary }]}
        >
          {renewalText}
        </AtomicText>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={actions.onCheckCredits}
      >
        <AtomicText
          type="bodyMedium"
          style={[styles.buttonText, { color: tokens.colors.textPrimary }]}
        >
          {creditsText}
        </AtomicText>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={actions.onTestDuplicate}
      >
        <AtomicText
          type="bodyMedium"
          style={[styles.buttonText, { color: tokens.colors.textPrimary }]}
        >
          {duplicateText}
        </AtomicText>
      </TouchableOpacity>
    </View>
  );
};
