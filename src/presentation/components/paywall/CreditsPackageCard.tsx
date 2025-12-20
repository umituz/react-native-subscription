/**
 * Credits Package Card Component
 * Single Responsibility: Display a single credits package option
 */

import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { AtomicText } from "@umituz/react-native-design-system";
import { useAppDesignTokens } from "@umituz/react-native-design-system";
import type { CreditsPackage } from "../../../domain/entities/paywall/CreditsPackage";

interface CreditsPackageCardProps {
  package: CreditsPackage;
  isSelected: boolean;
  onSelect: () => void;
}

export const CreditsPackageCard: React.FC<CreditsPackageCardProps> =
  React.memo(({ package: pkg, isSelected, onSelect }) => {
    const tokens = useAppDesignTokens();

    const totalCredits = pkg.credits + (pkg.bonus || 0);

    return (
      <TouchableOpacity
        style={[
          styles.container,
          {
            backgroundColor: isSelected
              ? tokens.colors.primaryLight
              : tokens.colors.surface,
            borderColor: isSelected
              ? tokens.colors.primary
              : tokens.colors.border,
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
        onPress={onSelect}
        activeOpacity={0.8}
      >
        {pkg.badge && (
          <View
            style={[styles.badge, { backgroundColor: tokens.colors.warning }]}
          >
            <AtomicText
              type="labelSmall"
              style={{ color: tokens.colors.onPrimary, fontWeight: "700" }}
            >
              {pkg.badge}
            </AtomicText>
          </View>
        )}
        <View style={styles.content}>
          <View style={styles.leftSection}>
            <AtomicText
              type="headlineMedium"
              style={[styles.credits, { color: tokens.colors.textPrimary }]}
            >
              {totalCredits.toLocaleString()} Credits
            </AtomicText>
            {(pkg.bonus ?? 0) > 0 && (
              <AtomicText
                type="bodySmall"
                style={[styles.bonus, { color: tokens.colors.success }]}
              >
                +{pkg.bonus} bonus
              </AtomicText>
            )}
            {pkg.description && (
              <AtomicText
                type="bodySmall"
                style={{ color: tokens.colors.textSecondary }}
              >
                {pkg.description}
              </AtomicText>
            )}
          </View>
          <View style={styles.rightSection}>
            <AtomicText
              type="titleLarge"
              style={[styles.price, { color: tokens.colors.primary }]}
            >
              {pkg.currency} {pkg.price.toFixed(2)}
            </AtomicText>
          </View>
        </View>
      </TouchableOpacity>
    );
  });

CreditsPackageCard.displayName = "CreditsPackageCard";

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -10,
    right: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftSection: {
    flex: 1,
  },
  credits: {
    fontWeight: "700",
    marginBottom: 4,
  },
  bonus: {
    fontWeight: "600",
    marginBottom: 4,
  },
  rightSection: {
    alignItems: "flex-end",
  },
  price: {
    fontWeight: "700",
  },
});
