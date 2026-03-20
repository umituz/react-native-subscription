import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { AtomicText, AtomicSpinner } from "@umituz/react-native-design-system/atoms";
import { useAppDesignTokens } from "@umituz/react-native-design-system/theme";
import { useResponsive } from "@umituz/react-native-design-system/responsive";
import type { PaywallTranslations, PaywallLegalUrls } from "../entities/types";

interface PaywallFooterProps {
  translations: PaywallTranslations;
  legalUrls: PaywallLegalUrls;
  isProcessing: boolean;
  onPurchase?: () => void | Promise<void>;
  onRestore?: () => Promise<void | boolean>;
  onLegalClick: (url: string | undefined) => void;
  purchaseButtonText?: string;
}

export const PaywallFooter: React.FC<PaywallFooterProps> = React.memo(({
  translations,
  legalUrls,
  isProcessing,
  onPurchase,
  onRestore,
  onLegalClick,
  purchaseButtonText,
}) => {
  const tokens = useAppDesignTokens();
  const responsive = useResponsive();

  // Base values that will be scaled by spacingMultiplier
  const BASE_BUTTON_HEIGHT = 56;
  const BASE_FONT_SIZE = 17;
  const BASE_PADDING_VERTICAL = 16;
  const BASE_SPACING = 12;

  // Responsive values using spacingMultiplier
  const buttonHeight = React.useMemo(
    () => Math.round(BASE_BUTTON_HEIGHT * responsive.spacingMultiplier),
    [responsive, BASE_BUTTON_HEIGHT]
  );

  const fontSize = React.useMemo(
    () => responsive.getFontSize(BASE_FONT_SIZE),
    [responsive, BASE_FONT_SIZE]
  );

  const paddingVertical = React.useMemo(
    () => Math.round(BASE_PADDING_VERTICAL * responsive.spacingMultiplier),
    [responsive, BASE_PADDING_VERTICAL]
  );

  const spacing = React.useMemo(
    () => Math.round(BASE_SPACING * responsive.spacingMultiplier),
    [responsive, BASE_SPACING]
  );

  const paddingHorizontal = React.useMemo(
    () => responsive.horizontalPadding,
    [responsive]
  );

  return (
    <View style={[footerStyles.container, { paddingHorizontal, paddingVertical: spacing, gap: spacing }]}>
      {/* Purchase Button - Responsive sizing */}
      {onPurchase && (
        <TouchableOpacity
          onPress={onPurchase}
          disabled={isProcessing}
          activeOpacity={0.8}
          style={[
            footerStyles.purchaseButton,
            {
              backgroundColor: tokens.colors.primary,
              height: buttonHeight,
              paddingVertical: paddingVertical,
            },
            isProcessing && footerStyles.buttonDisabled,
          ]}
        >
          {isProcessing ? (
            <View style={footerStyles.loadingContainer}>
              <AtomicSpinner size="sm" />
            </View>
          ) : (
            <AtomicText style={[footerStyles.purchaseButtonText, { color: tokens.colors.textPrimary, fontSize }]}>
              {purchaseButtonText || translations.purchaseButtonText}
            </AtomicText>
          )}
        </TouchableOpacity>
      )}

      {/* Footer Links - Stacked layout (Restore on top, Legal on bottom) */}
      <View style={{ marginTop: spacing, alignItems: 'center', gap: 12 }}>
        {onRestore && (
          <TouchableOpacity
            onPress={onRestore}
            disabled={isProcessing}
            activeOpacity={0.6}
            style={footerStyles.restoreButton}
          >
            <AtomicText style={[footerStyles.legalText, { color: tokens.colors.textSecondary, fontWeight: '600' }]}>
              {translations.restoreButtonText}
            </AtomicText>
          </TouchableOpacity>
        )}

        <View style={footerStyles.legalContainer}>
          {legalUrls.termsUrl && (
            <TouchableOpacity
              onPress={() => onLegalClick(legalUrls.termsUrl)}
              activeOpacity={0.6}
            >
              <AtomicText style={[footerStyles.legalText, { color: tokens.colors.textTertiary }]}>
                {translations.termsOfServiceText}
              </AtomicText>
            </TouchableOpacity>
          )}

          {legalUrls.privacyUrl && (
            <>
              <AtomicText style={footerStyles.legalSeparator}> • </AtomicText>
              <TouchableOpacity
                onPress={() => onLegalClick(legalUrls.privacyUrl)}
                activeOpacity={0.6}
              >
                <AtomicText style={[footerStyles.legalText, { color: tokens.colors.textTertiary }]}>
                  {translations.privacyText}
                </AtomicText>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
});

// Modern footer styles
const footerStyles = StyleSheet.create({
  container: {
    width: '100%',
  },
  purchaseButton: {
    width: '100%',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  purchaseButtonText: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  restoreButton: {
    alignItems: 'center',
  },
  restoreText: {
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  legalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  legalText: {
    lineHeight: 16,
  },
  legalSeparator: {
    color: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 4,
  },
});
