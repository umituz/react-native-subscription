import React from "react";
import { View, TouchableOpacity } from "react-native";
import { AtomicText, AtomicSpinner } from "@umituz/react-native-design-system/atoms";
import { useAppDesignTokens } from "@umituz/react-native-design-system/theme";
import type { PaywallTranslations, PaywallLegalUrls } from "../entities/types";
import { paywallScreenStyles as styles } from "./PaywallScreen.styles";

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
    <View style={styles.footer}>
      {/* Purchase Button */}
      {onPurchase && (
        <TouchableOpacity
          onPress={onPurchase}
          disabled={isProcessing}
          style={[
            styles.purchaseButton,
            isProcessing && styles.ctaDisabled,
            { backgroundColor: tokens.colors.primary }
          ]}
        >
          {isProcessing ? (
            <AtomicSpinner size="sm" />
          ) : (
            <AtomicText type="body" style={[styles.purchaseButtonText, { color: tokens.colors.textPrimary }]}>
              {purchaseButtonText || translations.purchaseButtonText}
            </AtomicText>
          )}
        </TouchableOpacity>
      )}

      {/* Restore Button */}
      {onRestore && (
        <TouchableOpacity onPress={onRestore} disabled={isProcessing} style={[styles.restoreButton, isProcessing && styles.ctaDisabled]}>
          <AtomicText type="bodySmall" style={[styles.footerLink, { color: tokens.colors.textSecondary }]}>
            {isProcessing ? translations.processingText : translations.restoreButtonText}
          </AtomicText>
        </TouchableOpacity>
      )}

      {/* Legal Links */}
      <View style={styles.legalRow}>
        {legalUrls.termsUrl && (
          <TouchableOpacity onPress={() => onLegalClick(legalUrls.termsUrl)}>
            <AtomicText type="bodySmall" style={[styles.footerLink, { color: tokens.colors.textSecondary }]}>
              {translations.termsOfServiceText}
            </AtomicText>
          </TouchableOpacity>
        )}
        {legalUrls.privacyUrl && (
          <TouchableOpacity onPress={() => onLegalClick(legalUrls.privacyUrl)}>
            <AtomicText type="bodySmall" style={[styles.footerLink, { color: tokens.colors.textSecondary }]}>
              {translations.privacyText}
            </AtomicText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});
