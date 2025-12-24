/**
 * Dev Test Section
 * Developer testing tools for subscription renewals
 * Only visible in __DEV__ mode
 */

import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { AtomicText, useAppDesignTokens } from "@umituz/react-native-design-system";

export interface DevTestActions {
  onTestRenewal: () => Promise<void>;
  onCheckCredits: () => void;
  onTestDuplicate: () => Promise<void>;
}

export interface DevTestSectionProps {
  actions: DevTestActions;
  title?: string;
}

export const DevTestSection: React.FC<DevTestSectionProps> = ({
  actions,
  title = "🧪 Developer Testing",
}) => {
  const tokens = useAppDesignTokens();

  if (!__DEV__) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: tokens.colors.surfaceSecondary,
          borderTopColor: tokens.colors.border,
        },
      ]}
    >
      <AtomicText
        type="titleMedium"
        style={[styles.title, { color: tokens.colors.textPrimary }]}
      >
        {title}
      </AtomicText>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: tokens.colors.primary }]}
        onPress={actions.onTestRenewal}
      >
        <AtomicText
          type="bodyMedium"
          style={[styles.buttonText, { color: tokens.colors.onPrimary }]}
        >
          ⚡ Test Auto-Renewal (Add Credits)
        </AtomicText>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: tokens.colors.surfaceSecondary,
            borderWidth: 1,
            borderColor: tokens.colors.border,
          },
        ]}
        onPress={actions.onCheckCredits}
      >
        <AtomicText
          type="bodyMedium"
          style={[styles.buttonText, { color: tokens.colors.textPrimary }]}
        >
          📊 Check Current Credits
        </AtomicText>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: tokens.colors.surfaceSecondary,
            borderWidth: 1,
            borderColor: tokens.colors.border,
          },
        ]}
        onPress={actions.onTestDuplicate}
      >
        <AtomicText
          type="bodyMedium"
          style={[styles.buttonText, { color: tokens.colors.textPrimary }]}
        >
          🔒 Test Duplicate Protection
        </AtomicText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  title: {
    fontWeight: "600",
    marginBottom: 4,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "500",
  },
});
