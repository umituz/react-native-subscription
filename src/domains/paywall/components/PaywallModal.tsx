/**
 * Paywall Modal
 * Renders packages passed from PaywallContainer
 * Filtering is handled by PaywallContainer based on mode
 */

import React, { useState, useCallback } from "react";
import { View, ScrollView, TouchableOpacity, Linking, type ImageSourcePropType } from "react-native";
import { BaseModal, useAppDesignTokens, AtomicText, AtomicIcon, AtomicSpinner } from "@umituz/react-native-design-system";
import { Image } from "expo-image";
import type { PurchasesPackage } from "react-native-purchases";
import { PlanCard } from "./PlanCard";
import type { SubscriptionFeature, PaywallTranslations, PaywallLegalUrls } from "../entities";
import { paywallModalStyles as styles } from "./PaywallModal.styles";

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
  const {
    visible,
    onClose,
    translations,
    packages = [],
    features = [],
    isLoading = false,
    legalUrls = {},
    bestValueIdentifier,
    creditAmounts,
    creditsLabel,
    heroImage,
    onPurchase,
    onRestore,
  } = props;

  const tokens = useAppDesignTokens();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = useCallback(async () => {
    if (!selectedPlanId || !onPurchase) return;
    setIsProcessing(true);
    try {
      const pkg = packages.find((p) => p.product.identifier === selectedPlanId);
      if (pkg) await onPurchase(pkg);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedPlanId, packages, onPurchase]);

  const handleRestore = useCallback(async () => {
    if (!onRestore || isProcessing) return;
    setIsProcessing(true);
    try {
      await onRestore();
    } finally {
      setIsProcessing(false);
    }
  }, [onRestore, isProcessing]);

  const handleLegalUrl = useCallback(async (url: string | undefined) => {
    if (!url) return;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
    } catch {
      // Silent fail
    }
  }, []);

  const isPurchaseDisabled = !selectedPlanId;

  return (
    <BaseModal visible={visible} onClose={onClose} contentStyle={styles.modalContent}>
      <View style={[styles.container, { backgroundColor: tokens.colors.surface }]}>
        <TouchableOpacity
          onPress={onClose}
          style={[styles.closeBtn, { backgroundColor: tokens.colors.surfaceSecondary }]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <AtomicIcon name="close-outline" size="md" customColor={tokens.colors.textPrimary} />
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {heroImage && (
            <View style={styles.heroContainer}>
              <Image source={heroImage} style={styles.heroImage} contentFit="cover" transition={300} />
            </View>
          )}

          <View style={styles.header}>
            <AtomicText type="headlineMedium" style={[styles.title, { color: tokens.colors.textPrimary }]}>
              {translations.title}
            </AtomicText>
            {translations.subtitle && (
              <AtomicText type="bodyMedium" style={[styles.subtitle, { color: tokens.colors.textSecondary }]}>
                {translations.subtitle}
              </AtomicText>
            )}
          </View>

          {features.length > 0 && (
            <View style={[styles.features, { backgroundColor: tokens.colors.surfaceSecondary }]}>
              {features.map((feature, idx) => (
                <View key={idx} style={styles.featureRow}>
                  <View style={[styles.featureIcon, { backgroundColor: tokens.colors.primaryLight }]}>
                    <AtomicIcon name={feature.icon} customSize={16} customColor={tokens.colors.primary} />
                  </View>
                  <AtomicText type="bodyMedium" style={[styles.featureText, { color: tokens.colors.textPrimary }]}>
                    {feature.text}
                  </AtomicText>
                </View>
              ))}
            </View>
          )}

          {isLoading ? (
            <View style={styles.loading}>
              <AtomicSpinner size="lg" color="primary" text={translations.loadingText} />
            </View>
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
            disabled={isPurchaseDisabled || isProcessing}
            style={[
              styles.cta,
              { backgroundColor: tokens.colors.primary },
              (isPurchaseDisabled || isProcessing) && styles.ctaDisabled,
            ]}
            activeOpacity={0.8}
          >
            <AtomicText type="titleLarge" style={[styles.ctaText, { color: tokens.colors.onPrimary }]}>
              {isProcessing ? translations.processingText : translations.purchaseButtonText}
            </AtomicText>
          </TouchableOpacity>

          <View style={styles.footer}>
            {onRestore && (
              <TouchableOpacity
                onPress={handleRestore}
                disabled={isProcessing}
                style={[styles.restoreButton, isProcessing && styles.restoreButtonDisabled]}
              >
                <AtomicText type="bodySmall" style={[styles.footerLink, { color: tokens.colors.textSecondary }]}>
                  {isProcessing ? translations.processingText : translations.restoreButtonText}
                </AtomicText>
              </TouchableOpacity>
            )}
            <View style={styles.legalRow}>
              {legalUrls.termsUrl && (
                <TouchableOpacity onPress={() => handleLegalUrl(legalUrls.termsUrl)}>
                  <AtomicText type="bodySmall" style={[styles.footerLink, { color: tokens.colors.textSecondary }]}>
                    {translations.termsOfServiceText}
                  </AtomicText>
                </TouchableOpacity>
              )}
              {legalUrls.privacyUrl && (
                <TouchableOpacity onPress={() => handleLegalUrl(legalUrls.privacyUrl)}>
                  <AtomicText type="bodySmall" style={[styles.footerLink, { color: tokens.colors.textSecondary }]}>
                    {translations.privacyText}
                  </AtomicText>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </BaseModal>
  );
});

PaywallModal.displayName = "PaywallModal";
