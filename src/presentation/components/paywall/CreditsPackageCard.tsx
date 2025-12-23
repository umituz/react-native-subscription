/**
 * Credits Package Card Component
 * Selectable card for credit packages
 */

import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import {
  AtomicText,
  AtomicIcon,
  AtomicBadge,
  useAppDesignTokens,
} from "@umituz/react-native-design-system";
import type { CreditsPackage } from "../../../domain/entities/paywall/CreditsPackage";

interface CreditsPackageCardProps {
  package: CreditsPackage;
  isSelected: boolean;
  onSelect: () => void;
}

export const CreditsPackageCard: React.FC<CreditsPackageCardProps> = React.memo(
  ({ package: pkg, isSelected, onSelect }) => {
    const tokens = useAppDesignTokens();
    const totalCredits = pkg.credits + (pkg.bonus || 0);

    return (
      <TouchableOpacity
        onPress={onSelect}
        activeOpacity={0.7}
        style={styles.touchable}
      >
        <View
          style={[
            styles.container,
            {
              backgroundColor: tokens.colors.surface,
              borderColor: isSelected ? tokens.colors.primary : tokens.colors.border,
              borderWidth: isSelected ? 2 : 1,
            },
          ]}
        >
          {pkg.badge && (
            <View style={styles.badgeContainer}>
              <AtomicBadge text={pkg.badge} variant="warning" size="sm" />
            </View>
          )}

          <View style={styles.content}>
            <View style={styles.leftSection}>
              <View style={styles.creditsRow}>
                <AtomicIcon
                  name="flash"
                  size="md"
                  color={isSelected ? "primary" : "secondary"}
                />
                <AtomicText
                  type="headlineSmall"
                  style={[
                    styles.credits,
                    { color: isSelected ? tokens.colors.primary : tokens.colors.textPrimary },
                  ]}
                >
                  {totalCredits.toLocaleString()}
                </AtomicText>
              </View>

              {(pkg.bonus ?? 0) > 0 && (
                <View style={styles.bonusContainer}>
                  <AtomicIcon name="gift-outline" size="sm" color="success" />
                  <AtomicText
                    type="bodySmall"
                    style={[styles.bonus, { color: tokens.colors.success }]}
                  >
                    +{pkg.bonus}
                  </AtomicText>
                </View>
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
                style={[
                  styles.price,
                  { color: isSelected ? tokens.colors.primary : tokens.colors.textPrimary },
                ]}
              >
                {pkg.currency}{pkg.price.toFixed(2)}
              </AtomicText>
              {isSelected && (
                <AtomicIcon name="checkmark-circle" size="md" color="primary" />
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
);

CreditsPackageCard.displayName = "CreditsPackageCard";

const styles = StyleSheet.create({
  touchable: {
    marginBottom: 12,
  },
  container: {
    borderRadius: 16,
    padding: 16,
    position: "relative",
  },
  badgeContainer: {
    position: "absolute",
    top: -10,
    right: 16,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftSection: {
    flex: 1,
    marginRight: 16,
  },
  creditsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  credits: {
    fontWeight: "700",
    marginLeft: 8,
  },
  bonusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  bonus: {
    fontWeight: "600",
    marginLeft: 4,
  },
  rightSection: {
    alignItems: "flex-end",
  },
  price: {
    fontWeight: "700",
    marginBottom: 4,
  },
});
