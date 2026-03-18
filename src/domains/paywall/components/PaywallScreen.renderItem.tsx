/**
 * PaywallScreen Render Item Component
 * Separated for better maintainability
 */

import React from "react";
import { View, ListRenderItem } from "react-native";
import type { ImageSourcePropType } from "react-native";
import { AtomicText, AtomicIcon } from "@umituz/react-native-design-system/atoms";
import { Image } from "expo-image";
import { PlanCard } from "./PlanCard";
import type { PaywallListItem } from "../utils/paywallLayoutUtils";
import { paywallScreenStyles as styles } from "./PaywallScreen.styles";

interface PaywallRenderItemProps {
  item: PaywallListItem;
  tokens: any;
  translations: any;
  heroImage?: ImageSourcePropType;
  selectedPlanId?: string;
  bestValueIdentifier?: string;
  creditAmounts?: Record<string, number>;
  creditsLabel?: string;
  onSelectPlan?: (planId: string) => void;
}

export const PaywallRenderItem: React.FC<PaywallRenderItemProps> = React.memo(({
  item,
  tokens,
  translations,
  heroImage,
  selectedPlanId,
  bestValueIdentifier,
  creditAmounts,
  creditsLabel,
  onSelectPlan,
}) => {
  if (!translations) return null;

  switch (item.type) {
    case 'HEADER':
      return (
        <View key="header">
          {/* Hero Image */}
          {heroImage && (
            <View style={styles.heroContainer}>
              <Image source={heroImage} style={styles.heroImage} contentFit="cover" transition={200} />
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
        <View key="feat-header" style={styles.sectionHeader}>
          <AtomicText type="labelLarge" style={[styles.sectionTitle, { color: tokens.colors.textSecondary }]}>
            {translations.featuresTitle || "WHAT'S INCLUDED"}
          </AtomicText>
        </View>
      );

    case 'FEATURE':
      return (
        <View key={`feat-${item.feature.text}`} style={[styles.featureRow, { marginHorizontal: 24, marginBottom: 16 }]}>
          <View style={[styles.featureIcon, { backgroundColor: tokens.colors.primary }]}>
            <AtomicIcon name={item.feature.icon} customSize={16} customColor={tokens.colors.onPrimary} />
          </View>
          <AtomicText type="bodyMedium" style={[styles.featureText, { color: tokens.colors.textPrimary }]}>
            {item.feature.text}
          </AtomicText>
        </View>
      );

    case 'PLAN_HEADER':
      return (
        <View key="plan-header" style={styles.sectionHeader}>
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
