/**
 * Subscription Plan Card Component
 * Single Responsibility: Display a subscription plan option
 */

import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import type { PurchasesPackage } from "react-native-purchases";
import { AtomicText } from "@umituz/react-native-design-system";
import { useAppDesignTokens, withAlpha } from "@umituz/react-native-design-system";
import { formatPrice } from "../../../utils/priceUtils";
import { useLocalization } from "@umituz/react-native-localization";
import { BestValueBadge } from "./BestValueBadge";

import { getPeriodLabel, isYearlyPackage } from "../../../utils/packagePeriodUtils";
// @ts-ignore
import { LinearGradient } from "expo-linear-gradient";

interface SubscriptionPlanCardProps {
  package: PurchasesPackage;
  isSelected: boolean;
  onSelect: () => void;
  isBestValue?: boolean;
  /** Optional: Number of credits/generations included with this package */
  creditAmount?: number;
}

export const SubscriptionPlanCard: React.FC<SubscriptionPlanCardProps> =
  React.memo(({ package: pkg, isSelected, onSelect, isBestValue = false, creditAmount }) => {
    const tokens = useAppDesignTokens();
    const { t } = useLocalization();

    const period = pkg.product.subscriptionPeriod;
    const isYearly = isYearlyPackage(pkg);
    const periodLabel = getPeriodLabel(period);
    const price = formatPrice(pkg.product.price, pkg.product.currencyCode);
    const monthlyEquivalent = isYearly
      ? formatPrice(pkg.product.price / 12, pkg.product.currencyCode)
      : null;

    const title = pkg.product.title || t(`paywall.period.${periodLabel}`);

    const CardComponent = isSelected ? LinearGradient : View;
    const cardProps = isSelected
      ? {
        colors: [withAlpha(tokens.colors.primary, 0.2), tokens.colors.surface],
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
      }
      : {};

    return (
      <TouchableOpacity
        onPress={onSelect}
        activeOpacity={0.8}
        style={[
          styles.container,
          {
            borderColor: isSelected
              ? tokens.colors.primary
              : tokens.colors.borderLight,
            borderWidth: isSelected ? 2 : 1,
            backgroundColor: isSelected ? undefined : tokens.colors.surface,
          },
        ]}
      >
        <CardComponent {...(cardProps as any)} style={styles.gradientWrapper}>
          <BestValueBadge text={t("paywall.bestValue")} visible={isBestValue} />

          <View style={styles.content}>
            <View style={styles.leftSection}>
              <View
                style={[
                  styles.radio,
                  {
                    borderColor: isSelected
                      ? tokens.colors.primary
                      : tokens.colors.border,
                  },
                ]}
              >
                {isSelected && (
                  <View
                    style={[
                      styles.radioInner,
                      { backgroundColor: tokens.colors.primary },
                    ]}
                  />
                )}
              </View>
              <View style={styles.textContainer}>
                <AtomicText
                  type="titleSmall"
                  style={[styles.title, { color: tokens.colors.textPrimary }]}
                >
                  {title}
                </AtomicText>
                {isYearly && (
                  <AtomicText
                    type="bodySmall"
                    style={{ color: tokens.colors.textSecondary, fontSize: 11 }}
                  >
                    {price}
                  </AtomicText>
                )}
              </View>
            </View>

            <View style={styles.rightSection}>
              {creditAmount && (
                <View
                  style={[
                    styles.creditBadge,
                    {
                      backgroundColor: withAlpha(tokens.colors.primary, 0.25), // Increased alpha
                      borderColor: withAlpha(tokens.colors.primary, 0.4),
                      borderWidth: 1,
                      flexDirection: "row",
                      alignItems: "center"
                    },
                  ]}
                >
                  <AtomicText
                    type="labelSmall"
                    style={{
                      color: tokens.colors.primary,
                      fontWeight: "800",
                      fontSize: 11,
                    }}
                  >
                    {creditAmount} {t("paywall.credits") || "Credits"}
                  </AtomicText>
                </View>
              )}
              <AtomicText
                type="titleMedium"
                style={[styles.price, { color: tokens.colors.textPrimary }]}
              >
                {isYearly && monthlyEquivalent
                  ? `${monthlyEquivalent}/mo`
                  : price}
              </AtomicText>
            </View>
          </View>
        </CardComponent>
      </TouchableOpacity>
    );
  });


SubscriptionPlanCard.displayName = "SubscriptionPlanCard";

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    position: "relative",
    overflow: "hidden", // Important for gradient borders/corners
  },
  gradientWrapper: {
    flex: 1,
    padding: 18,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: "600",
    marginBottom: 2,
  },
  creditBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  rightSection: {
    alignItems: "flex-end",
  },
  price: {
    fontWeight: "700",
  },
});
