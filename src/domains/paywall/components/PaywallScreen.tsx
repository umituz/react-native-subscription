/**
 * Paywall Screen Component
 *
 * Full-screen paywall with optimized FlatList for performance and modern design.
 */

import React, { useCallback, useEffect, useMemo } from "react";
import { 
  View, 
  TouchableOpacity, 
  Linking, 
  FlatList, 
  ListRenderItem, 
  StatusBar,
} from "react-native";
import { AtomicText, AtomicIcon, AtomicSpinner } from "@umituz/react-native-design-system/atoms";
import { useSafeAreaInsets } from "@umituz/react-native-design-system/safe-area";
import { useAppDesignTokens } from "@umituz/react-native-design-system/theme";
import { Image } from "expo-image";
import type { PurchasesPackage } from "react-native-purchases";
import { PlanCard } from "./PlanCard";
import { paywallScreenStyles as styles } from "./PaywallScreen.styles";
import { PaywallFooter } from "./PaywallFooter";
import { usePaywallActions } from "../hooks/usePaywallActions";
import { PaywallScreenProps } from "./PaywallScreen.types";
import type { SubscriptionFeature } from "../entities/types";

type PaywallListItem = 
  | { type: 'HEADER' }
  | { type: 'FEATURE_HEADER' }
  | { type: 'FEATURE'; feature: SubscriptionFeature }
  | { type: 'PLAN_HEADER' }
  | { type: 'PLAN'; pkg: PurchasesPackage };

export const PaywallScreen: React.FC<PaywallScreenProps> = React.memo((props) => {
  const {
    onClose,
    translations,
    packages = [],
    features = [],
    legalUrls = {},
    bestValueIdentifier,
    creditAmounts,
    creditsLabel,
    heroImage,
    onPurchase,
    onRestore,
    onPurchaseSuccess,
    onPurchaseError,
    onAuthRequired,
    source,
    isLoadingPackages
  } = props;

  const tokens = useAppDesignTokens();
  const insets = useSafeAreaInsets();

  const { selectedPlanId, setSelectedPlanId, isProcessing, handlePurchase, handleRestore } = usePaywallActions({
    packages,
    onPurchase,
    onRestore,
    source,
    onPurchaseSuccess,
    onPurchaseError,
    onAuthRequired,
    onClose
  });

  // Auto-select first package
  useEffect(() => {
    if (packages.length > 0 && !selectedPlanId) {
      setSelectedPlanId(packages[0].product.identifier);
    }
  }, [packages, selectedPlanId, setSelectedPlanId]);

  const handleLegalUrl = useCallback(async (url: string | undefined) => {
    if (!url) return;
    try {
      if (await Linking.canOpenURL(url)) await Linking.openURL(url);
    } catch (error) {
      console.error('[PaywallScreen] Failed to open URL:', error);
    }
  }, []);

  // Prepare flat data for the list
  const flatData = useMemo(() => {
    const data: PaywallListItem[] = [];
    
    // 1. Header (Hero, Title, Subtitle)
    data.push({ type: 'HEADER' });

    // 2. Features Section
    if (features.length > 0) {
      data.push({ type: 'FEATURE_HEADER' });
      features.forEach(feature => {
        data.push({ type: 'FEATURE', feature });
      });
    }

    // 3. Plans Section
    if (packages.length > 0) {
      data.push({ type: 'PLAN_HEADER' });
      packages.forEach(pkg => {
        data.push({ type: 'PLAN', pkg });
      });
    }

    return data;
  }, [features, packages]);

  const renderItem: ListRenderItem<PaywallListItem> = useCallback(({ item }) => {
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
              <AtomicIcon name={item.feature.icon as any} customSize={16} customColor={tokens.colors.onPrimary} />
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
            onSelect={() => setSelectedPlanId(pid)}
          />
        );
      }

      default:
        return null;
    }
  }, [heroImage, translations, tokens, selectedPlanId, bestValueIdentifier, creditAmounts, creditsLabel, setSelectedPlanId]);

  // Performance Optimization: getItemLayout for FlatList
  const getItemLayout = useCallback((_data: any, index: number) => {
    // Estimated heights for different item types
    // HEADER: ~300, FEATURE_HEADER: ~60, FEATURE: ~46, PLAN_HEADER: ~60, PLAN: ~80
    let offset = 0;
    for (let i = 0; i < index; i++) {
      const item = flatData[i];
      if (item.type === 'HEADER') offset += 300;
      else if (item.type === 'FEATURE_HEADER' || item.type === 'PLAN_HEADER') offset += 60;
      else if (item.type === 'FEATURE') offset += 46;
      else if (item.type === 'PLAN') offset += 80;
    }
    
    const currentItem = flatData[index];
    let length = 80;
    if (currentItem.type === 'HEADER') length = 300;
    else if (currentItem.type === 'FEATURE_HEADER' || currentItem.type === 'PLAN_HEADER') length = 60;
    else if (currentItem.type === 'FEATURE') length = 46;
    
    return { length, offset, index };
  }, [flatData]);

  const keyExtractor = useCallback((item: PaywallListItem, index: number) => {
    if (item.type === 'FEATURE') return `feat-${item.feature.text}`;
    if (item.type === 'PLAN') return `plan-${item.pkg.product.identifier}`;
    return `${item.type}-${index}`;
  }, []);

  if (isLoadingPackages) {
    return (
      <View style={[styles.container, { backgroundColor: tokens.colors.backgroundPrimary, paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <AtomicSpinner size="lg" />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: tokens.colors.backgroundPrimary }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Absolute Close Button */}
      <View style={{ 
        position: 'absolute', 
        top: Math.max(insets.top, 16), 
        right: 0, 
        zIndex: 10,
      }}>
        <TouchableOpacity
          onPress={onClose}
          style={[styles.closeBtn, { backgroundColor: tokens.colors.surfaceSecondary }]}
          activeOpacity={0.7}
        >
          <AtomicIcon name="close-outline" size="sm" customColor={tokens.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <FlatList
        data={flatData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        windowSize={5}
        removeClippedSubviews={true}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        contentContainerStyle={[
          styles.listContent, 
          { 
            paddingTop: Math.max(insets.top, 20) + 40,
            paddingBottom: 220 
          }
        ]}
        showsVerticalScrollIndicator={false}
      />

      {/* Fixed Footer */}
      <View style={[
        styles.stickyFooter, 
        { 
          backgroundColor: tokens.colors.backgroundPrimary,
          paddingBottom: Math.max(insets.bottom, 24)
        }
      ]}>
        <TouchableOpacity
          onPress={handlePurchase}
          disabled={isProcessing || !selectedPlanId}
          style={[
            styles.cta,
            { backgroundColor: tokens.colors.primary },
            (isProcessing || !selectedPlanId) && styles.ctaDisabled
          ]}
          activeOpacity={0.8}
        >
          <AtomicText type="titleLarge" style={[styles.ctaText, { color: tokens.colors.onPrimary }]}>
            {isProcessing ? translations.processingText : translations.purchaseButtonText}
          </AtomicText>
        </TouchableOpacity>

        <PaywallFooter
          translations={translations}
          legalUrls={legalUrls}
          isProcessing={isProcessing}
          onRestore={onRestore ? handleRestore : undefined}
          onLegalClick={handleLegalUrl}
        />
      </View>
    </View>
  );
});

PaywallScreen.displayName = "PaywallScreen";
