/**
 * PaywallScreen Render Item Component
 * Separated for better maintainability
 */

import React from "react";
import { View } from "react-native";
import type { ImageSourcePropType } from "react-native";
import { AtomicText, AtomicIcon } from "@umituz/react-native-design-system/atoms";
import { useAppDesignTokens } from "@umituz/react-native-design-system/theme";
import { useResponsive } from "@umituz/react-native-design-system/responsive";
import { Image } from "expo-image";
import { PlanCard } from "./PlanCard";
import type { PaywallListItem } from "../utils/paywallLayoutUtils";
import type { PaywallTranslations } from "../entities/types";
import { paywallScreenStyles as styles } from "./PaywallScreen.styles";

interface PaywallRenderItemProps {
  item: PaywallListItem;
  translations: PaywallTranslations;
  heroImage?: ImageSourcePropType;
  selectedPlanId?: string;
  bestValueIdentifier?: string;
  creditAmounts?: Record<string, number>;
  creditsLabel?: string;
  onSelectPlan?: (planId: string) => void;
}

export const PaywallRenderItem: React.FC<PaywallRenderItemProps> = React.memo(({
  item,
  translations,
  heroImage,
  selectedPlanId,
  bestValueIdentifier,
  creditAmounts,
  creditsLabel,
  onSelectPlan,
}) => {
  const tokens = useAppDesignTokens();
  const responsive = useResponsive();

  // Responsive spacing
  const spacing = React.useMemo(
    () => Math.round(16 * responsive.spacingMultiplier),
    [responsive]
  );

  // Responsive feature icon size - use spacing multiplier directly to avoid max/min constraints from getIconSize
  const featureIconSize = React.useMemo(
    () => Math.round(30 * responsive.spacingMultiplier),
    [responsive]
  );

  // Responsive hero image size
  const heroImageSize = React.useMemo(
    () => responsive.getIconSize(120),
    [responsive]
  );

  if (!translations) return null;

  switch (item.type) {
    case 'HEADER':
      return (
        <View key="header">
          {/* Hero Image - Responsive sizing */}
          {heroImage && (
            <View style={styles.heroContainer}>
              <Image
                source={heroImage}
                style={[styles.heroImage, { width: heroImageSize, height: heroImageSize, borderRadius: heroImageSize * 0.25 }]}
                contentFit="cover"
                transition={200}
              />
            </View>
          )}

          {/* Header Text */}
          <View style={styles.header}>
            <AtomicText type="headlineLarge" style={[styles.title, { color: tokens.colors.textPrimary }]}>
              {translations.title}
            </AtomicText>
            {translations.subtitle && (
              <AtomicText type="bodyMedium" style={[styles.subtitle, { color: tokens.colors.textSecondary }]}>
                {translations.subtitle}
              </AtomicText>
            )}
          </View>
        </View>
      );

    case 'FEATURE_HEADER':
      return (
        <View key="feat-header" style={[styles.sectionHeader, { marginTop: spacing * 1.5 }]}>
          <AtomicText type="labelLarge" style={[styles.sectionTitle, { color: tokens.colors.textSecondary }]}>
            {translations.featuresTitle || "WHAT'S INCLUDED"}
          </AtomicText>
        </View>
      );

    case 'FEATURE':
      return (
        <View key={`feat-${item.feature.text}`} style={[styles.featureRow, { marginBottom: spacing }]}>
          <View style={[styles.featureIcon, { width: featureIconSize, height: featureIconSize, backgroundColor: tokens.colors.primary }]}>
            <AtomicIcon
              name={item.feature.icon}
              customSize={responsive.getFontSize(16)}
              customColor={tokens.colors.onPrimary}
            />
          </View>
          <AtomicText type="bodyMedium" style={[styles.featureText, { color: tokens.colors.textPrimary }]}>
            {item.feature.text}
          </AtomicText>
        </View>
      );

    case 'PLAN_HEADER':
      return (
        <View key="plan-header" style={[styles.sectionHeader, { marginTop: spacing * 1.5 }]}>
          <AtomicText type="labelLarge" style={[styles.sectionTitle, { color: tokens.colors.textSecondary }]}>
            {translations.plansTitle || "CHOOSE YOUR PLAN"}
          </AtomicText>
        </View>
      );

    case 'PLAN': {
      const pid = item.pkg.product.identifier;
      return (
        <PlanCard
          key={pid}
          pkg={item.pkg}
          isSelected={selectedPlanId === pid}
          badge={bestValueIdentifier === pid ? translations.bestValueBadgeText : undefined}
          creditAmount={creditAmounts?.[pid]}
          creditsLabel={creditsLabel}
          onSelect={() => onSelectPlan?.(pid)}
        />
      );
    }

    default:
      return null;
  }
});

PaywallRenderItem.displayName = "PaywallRenderItem";
