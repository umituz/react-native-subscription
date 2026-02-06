import React from "react";
import { View, TouchableOpacity } from "react-native";
import { AtomicText, useAppDesignTokens } from "@umituz/react-native-design-system";
import type { PaywallTranslations, PaywallLegalUrls } from "../entities/types";
import { paywallModalStyles as styles } from "./PaywallModal.styles";

interface PaywallFooterProps {
  translations: PaywallTranslations;
  legalUrls: PaywallLegalUrls;
  isProcessing: boolean;
  onRestore?: () => Promise<void | boolean>;
  onLegalClick: (url: string | undefined) => void;
}

export const PaywallFooter: React.FC<PaywallFooterProps> = ({
  translations,
  legalUrls,
  isProcessing,
  onRestore,
  onLegalClick,
}) => {
  const tokens = useAppDesignTokens();
  
  return (
    <View style={styles.footer}>
      {onRestore && (
        <TouchableOpacity onPress={onRestore} disabled={isProcessing} style={[styles.restoreButton, isProcessing && styles.restoreButtonDisabled]}>
          <AtomicText type="bodySmall" style={[styles.footerLink, { color: tokens.colors.textSecondary }]}>
            {isProcessing ? translations.processingText : translations.restoreButtonText}
          </AtomicText>
        </TouchableOpacity>
      )}
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
};
