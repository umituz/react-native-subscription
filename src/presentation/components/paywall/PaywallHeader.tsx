/**
 * Paywall Header Component
 * Single Responsibility: Display paywall header with close button
 */

import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { AtomicText, AtomicIcon } from "@umituz/react-native-design-system";
import { useAppDesignTokens } from "@umituz/react-native-design-system";

interface PaywallHeaderProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
}

export const PaywallHeader: React.FC<PaywallHeaderProps> = React.memo(
  ({ title, subtitle, onClose }) => {
    const tokens = useAppDesignTokens();

    return (
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <AtomicText
            type="headlineLarge"
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
        <TouchableOpacity
          onPress={onClose}
          style={[
            styles.closeButton,
            { backgroundColor: tokens.colors.surfaceSecondary },
          ]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <AtomicIcon name="X" size="md" color="secondary" />
        </TouchableOpacity>
      </View>
    );
  },
);

PaywallHeader.displayName = "PaywallHeader";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 16,
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 4,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});
