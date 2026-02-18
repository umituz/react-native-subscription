/**
 * Balance Card Component
 *
 * Displays user's credit balance with solid background.
 * Props-driven for full customization.
 */

import React from "react";
import { View, StyleSheet } from "react-native";

import {
    useAppDesignTokens,
    AtomicText,
    AtomicIcon,
} from "@umituz/react-native-design-system";

export interface BalanceCardTranslations {
  balanceLabel: string;
  availableCredits: string;
}

interface BalanceCardProps {
  balance: number;
  translations: BalanceCardTranslations;
  iconName?: string;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  translations,
  iconName = "wallet",
}) => {
  const tokens = useAppDesignTokens();


  return (
    <View
      style={[styles.container, { backgroundColor: tokens.colors.primary }]}
    >
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <AtomicText
            type="bodyMedium"
            style={[styles.label, { color: tokens.colors.onPrimary + "CC" }]}
          >
            {translations.balanceLabel}
          </AtomicText>
          <AtomicText
            type="displayLarge"
            style={[styles.balance, { color: tokens.colors.onPrimary }]}
          >
            {balance.toLocaleString()}
          </AtomicText>
          <AtomicText
            type="bodySmall"
            style={[styles.subtitle, { color: tokens.colors.onPrimary + "CC" }]}
          >
            {translations.availableCredits}
          </AtomicText>
        </View>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: tokens.colors.onPrimary + "20" },
          ]}
        >
          <AtomicIcon name={iconName} size="xl" color="onPrimary" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    opacity: 0.9,
  },
  balance: {
    fontSize: 36,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "400",
    opacity: 0.8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
});
