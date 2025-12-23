/**
 * Subscription Plan Card Component
 * Single Responsibility: Display a subscription plan option
 */

import React, { useMemo } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { AtomicText } from "@umituz/react-native-design-system";
import { useAppDesignTokens, withAlpha, useResponsive } from "@umituz/react-native-design-system";
import { formatPrice } from "../../../utils/priceUtils";
import { useLocalization } from "@umituz/react-native-localization";
import { BestValueBadge } from "./BestValueBadge";
import { getPeriodLabel, isYearlyPackage } from "../../../utils/packagePeriodUtils";
import { LinearGradient } from "expo-linear-gradient";
import type { SubscriptionPlanCardProps } from "./SubscriptionPlanCardTypes";

export type { SubscriptionPlanCardProps } from "./SubscriptionPlanCardTypes";

/**
 * Create responsive styles for subscription plan card
 */
const createStyles = (spacingMult: number, touchTarget: number) => {
  const basePadding = 18;
  const baseRadius = 16;
  const baseCreditRadius = 12;

  const radioSize = Math.max(touchTarget * 0.5, 24);
  const radioInnerSize = radioSize * 0.5;

  return StyleSheet.create({
    container: {
      borderRadius: baseRadius * spacingMult,
      position: "relative",
      overflow: "hidden",
    },
    gradientWrapper: {
      flex: 1,
      padding: basePadding * spacingMult,
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
      width: radioSize,
      height: radioSize,
      borderRadius: radioSize / 2,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16 * spacingMult,
    },
    radioInner: {
      width: radioInnerSize,
      height: radioInnerSize,
      borderRadius: radioInnerSize / 2,
    },
    textContainer: {
      flex: 1,
    },
    title: {
      fontWeight: "600",
      marginBottom: 2 * spacingMult,
    },
    creditBadge: {
      paddingHorizontal: 10 * spacingMult,
      paddingVertical: 4 * spacingMult,
      borderRadius: baseCreditRadius * spacingMult,
      marginBottom: 4 * spacingMult,
    },
    rightSection: {
      alignItems: "flex-end",
    },
    price: {
      fontWeight: "700",
    },
  });
};

export const SubscriptionPlanCard: React.FC<SubscriptionPlanCardProps> =
  React.memo(({ package: pkg, isSelected, onSelect, isBestValue = false, creditAmount }) => {
    const tokens = useAppDesignTokens();
    const { t } = useLocalization();
    const { spacingMultiplier, getFontSize, minTouchTarget } = useResponsive();

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

    // Responsive styles
    const styles = useMemo(() => createStyles(spacingMultiplier, minTouchTarget), [spacingMultiplier, minTouchTarget]);
    const secondaryFontSize = getFontSize(11);
    const creditFontSize = getFontSize(11);

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
                {isYearly && monthlyEquivalent && (
                  <AtomicText
                    type="bodySmall"
                    style={{ color: tokens.colors.textSecondary, fontSize: secondaryFontSize }}
                  >
                    {monthlyEquivalent}/mo
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
                      fontSize: creditFontSize,
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
                {price}
              </AtomicText>
            </View>
          </View>
        </CardComponent>
      </TouchableOpacity>
    );
  });


SubscriptionPlanCard.displayName = "SubscriptionPlanCard";