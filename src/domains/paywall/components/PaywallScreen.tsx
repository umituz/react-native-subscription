/**
 * Paywall Screen Component
 *
 * Full-screen paywall with optimized FlatList for performance and modern design.
 * Render logic separated to PaywallScreen.renderItem.tsx for better maintainability.
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
import { AtomicIcon, AtomicSpinner } from "@umituz/react-native-design-system/atoms";
import { useSafeAreaInsets } from "@umituz/react-native-design-system/safe-area";
import { useAppDesignTokens } from "@umituz/react-native-design-system/theme";
import { useResponsive } from "@umituz/react-native-design-system/responsive";
import { paywallScreenStyles as styles } from "./PaywallScreen.styles";
import { PaywallFooter } from "./PaywallFooter";
import { usePaywallActions } from "../hooks/usePaywallActions";
import { PaywallScreenProps } from "./PaywallScreen.types";
import {
  calculatePaywallItemLayout,
  type PaywallListItem
} from "../utils/paywallLayoutUtils";
import { hasItems } from "../../../shared/utils/arrayUtils";
import { PaywallRenderItem } from "./PaywallScreen.renderItem";
import { createLogger } from "../../../shared/utils/logger";

const logger = createLogger("PaywallScreen");

// Paywall layout constants
const PAYWALL_HEADER_HEIGHT = 60; // Close button + spacing
const PAYWALL_FOOTER_HEIGHT_BASE = 280; // Base footer height

export const PaywallScreen: React.FC<PaywallScreenProps> = React.memo((props) => {
  const navigation = useNavigation();

  logger.debug("Rendering PaywallScreen", {
    hasPackages: !!props.packages?.length,
    packagesCount: props.packages?.length || 0,
    isPremium: props.isPremium,
  });

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
  const responsive = useResponsive();

  const handleClose = useCallback(() => {
    logger.debug("Closing paywall");
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

  // Cleanup on unmount only - resetState is stable from useCallback
  useEffect(() => {
    return () => {
      logger.debug("Cleanup: resetting state");
      resetState();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-select first package
  useEffect(() => {
    if (hasItems(packages) && !selectedPlanId) {
      setSelectedPlanId(packages[0].product.identifier);
    }
    // setSelectedPlanId is stable from useState, packages.length is sufficient
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packages?.length, selectedPlanId]);

  const handleLegalUrl = useCallback(async (url: string | undefined) => {
    if (!url) return;
    try {
      if (await Linking.canOpenURL(url)) await Linking.openURL(url);
    } catch (error) {
      logger.error("Failed to open URL", error);
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
    return (
      <PaywallRenderItem
        item={item}
        translations={translations}
        heroImage={heroImage}
        selectedPlanId={selectedPlanId ?? undefined}
        bestValueIdentifier={bestValueIdentifier}
        creditAmounts={creditAmounts}
        creditsLabel={creditsLabel}
        onSelectPlan={setSelectedPlanId}
      />
    );
  }, [translations, heroImage, selectedPlanId, bestValueIdentifier, creditAmounts, creditsLabel, setSelectedPlanId]);

  // Performance Optimization: getItemLayout for FlatList
  const getItemLayout = useCallback((_data: ArrayLike<PaywallListItem> | null | undefined, index: number) => {
    return calculatePaywallItemLayout(flatData, index);
  }, [flatData]);

  const keyExtractor = useCallback((item: PaywallListItem, index: number) => {
    if (item.type === 'FEATURE') return `feat-${item.feature.text}`;
    if (item.type === 'PLAN') return `plan-${item.pkg.product.identifier}`;
    return `${item.type}-${index}`;
  }, []);

  // Defensive check for translations
  if (!translations) {
    logger.warn("Translations prop is missing");
    return null;
  }

  // Loading state
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

      {/* Absolute Close Button - Responsive positioning */}
      <View style={{
        position: 'absolute',
        top: Math.max(insets.top, 16),
        right: 16,
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

      {/* Main Content - Responsive spacing */}
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
            paddingTop: Math.max(insets.top, 20) + PAYWALL_HEADER_HEIGHT, // Responsive header spacing
            paddingBottom: PAYWALL_FOOTER_HEIGHT_BASE + responsive.verticalPadding, // Dynamic footer spacing
            paddingHorizontal: responsive.horizontalPadding, // Device-based horizontal padding
          }
        ]}
        showsVerticalScrollIndicator={false}
      />

      {/* Fixed Footer - Responsive positioning */}
      <View style={[styles.footerContainer, { paddingBottom: insets.bottom + responsive.verticalPadding }]}>
        <PaywallFooter
          translations={translations}
          legalUrls={legalUrls}
          isProcessing={isProcessing}
          onPurchase={handlePurchase}
          onRestore={handleRestore}
          onLegalClick={handleLegalUrl}
        />
      </View>
    </View>
  );
});

PaywallScreen.displayName = "PaywallScreen";
