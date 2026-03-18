/**
 * Paywall Screen Component
 *
 * Full-screen paywall with optimized FlatList for performance and modern design.
 * This is a "dumb" component that receives all data and actions via props.
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
import { useNavigation } from "@react-navigation/native";
import { AtomicText, AtomicIcon, AtomicSpinner } from "@umituz/react-native-design-system/atoms";
import { useSafeAreaInsets } from "@umituz/react-native-design-system/safe-area";
import { useAppDesignTokens } from "@umituz/react-native-design-system/theme";
import { Image } from "expo-image";
import { PlanCard } from "./PlanCard";
import { paywallScreenStyles as styles } from "./PaywallScreen.styles";
import { PaywallFooter } from "./PaywallFooter";
import { usePaywallActions } from "../hooks/usePaywallActions";
import { PaywallScreenProps } from "./PaywallScreen.types";
import {
  calculatePaywallItemLayout,
  type PaywallListItem
} from "../utils/paywallLayoutUtils";
import { hasItems } from "../../../shared/utils/arrayUtils";

export const PaywallScreen: React.FC<PaywallScreenProps> = React.memo((props) => {
  const navigation = useNavigation();

  if (__DEV__) {
    console.log('[PaywallScreen] 📱 Rendering PaywallScreen', {
      hasPackages: !!props.packages?.length,
      packagesCount: props.packages?.length || 0,
      isPremium: props.isPremium,
    });
  }

  const {
    translations,
    packages = [],
    features = [],
    legalUrls = {},
    bestValueIdentifier,
    creditAmounts,
    creditsLabel,
    heroImage,
    isSyncing,
    onPurchase,
    onRestore,
    onClose,
    onPurchaseSuccess,
    onPurchaseError,
    onAuthRequired,
    source,
  } = props;

  const tokens = useAppDesignTokens();
  const insets = useSafeAreaInsets();

  const handleClose = useCallback(() => {
    if (__DEV__) console.log('[PaywallScreen] 🔙 Closing paywall');
    if (onClose) {
      onClose();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [onClose, navigation]);

  const {
    selectedPlanId,
    setSelectedPlanId,
    isProcessing,
    handlePurchase,
    handleRestore,
    resetState
  } = usePaywallActions({
    packages,
    purchasePackage: onPurchase,
    restorePurchase: onRestore,
    source,
    onPurchaseSuccess,
    onPurchaseError,
    onAuthRequired,
    onClose: handleClose
  });

  useEffect(() => {
    return () => {
      if (__DEV__) console.log('[PaywallScreen] 🧹 Cleanup: resetting state');
      resetState();
    };
  }, [resetState]);

  // Auto-select first package
  useEffect(() => {
    if (hasItems(packages) && !selectedPlanId) {
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
    if (hasItems(features)) {
      data.push({ type: 'FEATURE_HEADER' });
      features.forEach(feature => {
        data.push({ type: 'FEATURE', feature });
      });
    }

    // 3. Plans Section
    if (hasItems(packages)) {
      data.push({ type: 'PLAN_HEADER' });
      packages.forEach(pkg => {
        data.push({ type: 'PLAN', pkg });
      });
    }

    return data;
  }, [features, packages]);

  const renderItem: ListRenderItem<PaywallListItem> = useCallback(({ item }) => {
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
            onSelect={() => setSelectedPlanId(pid)}
          />
        );
      }

      default:
        return null;
    }
  }, [heroImage, translations, tokens, selectedPlanId, bestValueIdentifier, creditAmounts, creditsLabel, setSelectedPlanId]);


  // Performance Optimization: getItemLayout for FlatList
  const getItemLayout = useCallback((_data: ArrayLike<PaywallListItem> | null, index: number) => {
    return calculatePaywallItemLayout(flatData, index);
  }, [flatData]);

  const keyExtractor = useCallback((item: PaywallListItem, index: number) => {
    if (item.type === 'FEATURE') return `feat-${item.feature.text}`;
    if (item.type === 'PLAN') return `plan-${item.pkg.product.identifier}`;
    return `${item.type}-${index}`;
  }, []);

  // Defensive check for translations moved to the end of hooks
  if (!translations) {
    if (__DEV__) console.warn("[PaywallScreen] Translations prop is missing");
    return null;
  }

  if (isSyncing) {
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
          onPress={handleClose}
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
          onRestore={handleRestore}
          onLegalClick={handleLegalUrl}
        />
      </View>
    </View>
  );
});

PaywallScreen.displayName = "PaywallScreen";
