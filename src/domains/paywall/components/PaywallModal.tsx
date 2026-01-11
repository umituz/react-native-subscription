/**
 * Paywall Modal
 */

import React, { useState, useCallback } from "react";
import { View, ScrollView, TouchableOpacity, Linking, type ImageSourcePropType } from "react-native";
import { BaseModal, useAppDesignTokens, AtomicText, AtomicIcon, AtomicSpinner } from "@umituz/react-native-design-system";
import { Image } from "expo-image";
import type { PurchasesPackage } from "react-native-purchases";
import { PlanCard } from "./PlanCard";
import type { SubscriptionFeature, PaywallTranslations, PaywallLegalUrls } from "../entities";
import { paywallModalStyles as styles } from "./PaywallModal.styles";
import { PaywallFeatures } from "./PaywallFeatures";
import { PaywallFooter } from "./PaywallFooter";
import { usePurchaseLoadingStore, selectIsPurchasing } from "../../../presentation/stores";

declare const __DEV__: boolean;

export interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  translations: PaywallTranslations;
  packages?: PurchasesPackage[];
  features?: SubscriptionFeature[];
  isLoading?: boolean;
  legalUrls?: PaywallLegalUrls;
  bestValueIdentifier?: string;
  creditAmounts?: Record<string, number>;
  creditsLabel?: string;
  heroImage?: ImageSourcePropType;
  onPurchase?: (pkg: PurchasesPackage) => Promise<void | boolean>;
  onRestore?: () => Promise<void | boolean>;
}

export const PaywallModal: React.FC<PaywallModalProps> = React.memo((props) => {
  const { visible, onClose, translations, packages = [], features = [], isLoading = false, legalUrls = {}, bestValueIdentifier, creditAmounts, creditsLabel, heroImage, onPurchase, onRestore } = props;
  const tokens = useAppDesignTokens();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isLocalProcessing, setIsLocalProcessing] = useState(false);

  // Global purchase loading state (for auto-execution after auth)
  const isGlobalPurchasing = usePurchaseLoadingStore(selectIsPurchasing);
  const { startPurchase, endPurchase } = usePurchaseLoadingStore();

  // Combined processing state
  const isProcessing = isLocalProcessing || isGlobalPurchasing;

  const handlePurchase = useCallback(async () => {
    if (!selectedPlanId || !onPurchase) return;

    if (__DEV__) {
      console.log("[PaywallModal] handlePurchase starting:", { selectedPlanId });
    }

    setIsLocalProcessing(true);
    startPurchase(selectedPlanId, "manual");

    try {
      const pkg = packages.find((p) => p.product.identifier === selectedPlanId);
      if (pkg) {
        if (__DEV__) {
          console.log("[PaywallModal] Calling onPurchase:", { productId: pkg.product.identifier });
        }
        await onPurchase(pkg);
        if (__DEV__) {
          console.log("[PaywallModal] onPurchase completed");
        }
      }
    } finally {
      setIsLocalProcessing(false);
      endPurchase();
      if (__DEV__) {
        console.log("[PaywallModal] handlePurchase finished");
      }
    }
  }, [selectedPlanId, packages, onPurchase, startPurchase, endPurchase]);

  const handleRestore = useCallback(async () => {
    if (!onRestore || isProcessing) return;

    if (__DEV__) {
      console.log("[PaywallModal] handleRestore starting");
    }

    setIsLocalProcessing(true);
    try {
      await onRestore();
      if (__DEV__) {
        console.log("[PaywallModal] handleRestore completed");
      }
    } finally {
      setIsLocalProcessing(false);
    }
  }, [onRestore, isProcessing]);

  const handleLegalUrl = useCallback(async (url: string | undefined) => {
    if (!url) return;
    try { if (await Linking.canOpenURL(url)) await Linking.openURL(url); } catch { /* Silent fail */ }
  }, []);

  return (
    <BaseModal visible={visible} onClose={onClose} contentStyle={styles.modalContent}>
      <View style={[styles.container, { backgroundColor: tokens.colors.surface }]}>
        <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: tokens.colors.surfaceSecondary }]} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <AtomicIcon name="close-outline" size="md" customColor={tokens.colors.textPrimary} />
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {heroImage && (
            <View style={styles.heroContainer}>
              <Image source={heroImage} style={styles.heroImage} contentFit="cover" transition={300} />
            </View>
          )}

          <View style={styles.header}>
            <AtomicText type="headlineMedium" style={[styles.title, { color: tokens.colors.textPrimary }]}>{translations.title}</AtomicText>
            {translations.subtitle && <AtomicText type="bodyMedium" style={[styles.subtitle, { color: tokens.colors.textSecondary }]}>{translations.subtitle}</AtomicText>}
          </View>

          <PaywallFeatures features={features} />

          {isLoading ? (
            <View style={styles.loading}><AtomicSpinner size="lg" color="primary" text={translations.loadingText} /></View>
          ) : (
            <View style={styles.plans}>
              {packages.map((pkg) => (
                <PlanCard
                  key={pkg.product.identifier}
                  pkg={pkg}
                  isSelected={selectedPlanId === pkg.product.identifier}
                  onSelect={() => setSelectedPlanId(pkg.product.identifier)}
                  badge={pkg.product.identifier === bestValueIdentifier ? translations.bestValueBadgeText : undefined}
                  creditAmount={creditAmounts?.[pkg.product.identifier]}
                  creditsLabel={creditsLabel}
                />
              ))}
            </View>
          )}

          <TouchableOpacity
            onPress={handlePurchase}
            disabled={!selectedPlanId || isProcessing}
            style={[styles.cta, { backgroundColor: tokens.colors.primary }, (!selectedPlanId || isProcessing) && styles.ctaDisabled]}
            activeOpacity={0.8}
          >
            <AtomicText type="titleLarge" style={[styles.ctaText, { color: tokens.colors.onPrimary }]}>
              {isProcessing ? translations.processingText : translations.purchaseButtonText}
            </AtomicText>
          </TouchableOpacity>

          <PaywallFooter translations={translations} legalUrls={legalUrls} isProcessing={isProcessing} onRestore={onRestore ? handleRestore : undefined} onLegalClick={handleLegalUrl} />
        </ScrollView>
      </View>
    </BaseModal>
  );
});

PaywallModal.displayName = "PaywallModal";
