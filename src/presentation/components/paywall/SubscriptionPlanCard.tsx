/**
 * Subscription Plan Card Component
 * Single Responsibility: Display a subscription plan option
 */

import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import type { PurchasesPackage } from "react-native-purchases";
import { AtomicText } from "@umituz/react-native-design-system";
import { useAppDesignTokens } from "@umituz/react-native-design-system";
import { formatPrice } from "../../../utils/priceUtils";
import { useLocalization } from "@umituz/react-native-localization";
import { BestValueBadge } from "./BestValueBadge";

interface SubscriptionPlanCardProps {
  package: PurchasesPackage;
  isSelected: boolean;
  onSelect: () => void;
  isBestValue?: boolean;
}

const getPeriodLabel = (period: string | null | undefined): string => {
  if (!period) return "";
  if (period.includes("Y") || period.includes("year")) return "yearly";
  if (period.includes("M") || period.includes("month")) return "monthly";
  if (period.includes("W") || period.includes("week")) return "weekly";
  if (period.includes("D") || period.includes("day")) return "daily";
  return "";
};

const isYearlyPeriod = (period: string | null | undefined): boolean => {
  return period?.includes("Y") || period?.includes("year") || false;
};

export const SubscriptionPlanCard: React.FC<SubscriptionPlanCardProps> =
  React.memo(({ package: pkg, isSelected, onSelect, isBestValue = false }) => {
    const tokens = useAppDesignTokens();
    const { t } = useLocalization();

    const period = pkg.product.subscriptionPeriod;
    const isYearly = isYearlyPeriod(period);
    const periodLabel = getPeriodLabel(period);
    const price = formatPrice(pkg.product.price, pkg.product.currencyCode);
    const monthlyEquivalent = isYearly
      ? formatPrice(pkg.product.price / 12, pkg.product.currencyCode)
      : null;

    const title = pkg.product.title || t(`paywall.period.${periodLabel}`);

    return (
      <TouchableOpacity
        onPress={onSelect}
        activeOpacity={0.8}
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
      >
        <BestValueBadge
          text={t("paywall.bestValue")}
          visible={isBestValue}
        />

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
                type="titleMedium"
                style={[styles.title, { color: tokens.colors.textPrimary }]}
              >
                {title}
              </AtomicText>
              {isYearly && (
                <AtomicText
                  type="bodySmall"
                  style={{ color: tokens.colors.textSecondary }}
                >
                  {price}
                </AtomicText>
              )}
            </View>
          </View>

          <View style={styles.rightSection}>
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
      </TouchableOpacity>
    );
  });

SubscriptionPlanCard.displayName = "SubscriptionPlanCard";

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 18,
    position: "relative",
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
  rightSection: {
    alignItems: "flex-end",
  },
  price: {
    fontWeight: "700",
  },
});
