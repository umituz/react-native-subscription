import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { AtomicText, AtomicSpinner } from "@umituz/react-native-design-system/atoms";
import { useAppDesignTokens } from "@umituz/react-native-design-system/theme";
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

  return (
    <View style={footerStyles.container}>
      {/* Purchase Button - Large and prominent */}
      {onPurchase && (
        <TouchableOpacity
          onPress={onPurchase}
          disabled={isProcessing}
          activeOpacity={0.8}
          style={[
            footerStyles.purchaseButton,
            { backgroundColor: tokens.colors.primary },
            isProcessing && footerStyles.buttonDisabled,
          ]}
        >
          {isProcessing ? (
            <View style={footerStyles.loadingContainer}>
              <AtomicSpinner size="sm" />
            </View>
          ) : (
            <AtomicText style={[footerStyles.purchaseButtonText, { color: tokens.colors.textPrimary }]}>
              {purchaseButtonText || translations.purchaseButtonText}
            </AtomicText>
          )}
        </TouchableOpacity>
      )}

      {/* Restore Link - Minimal */}
      {onRestore && (
        <TouchableOpacity
          onPress={onRestore}
          disabled={isProcessing}
          activeOpacity={0.6}
          style={footerStyles.restoreButton}
        >
          <AtomicText style={[footerStyles.restoreText, { color: tokens.colors.textSecondary }]}>
            {translations.restoreButtonText}
          </AtomicText>
        </TouchableOpacity>
      )}

      {/* Legal Links - Minimal */}
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
  );
});

// Modern footer styles
const footerStyles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  purchaseButton: {
    width: '100%',
    height: 56,
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
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  restoreText: {
    fontSize: 13,
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
    fontSize: 11,
    lineHeight: 16,
  },
  legalSeparator: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 4,
  },
});
