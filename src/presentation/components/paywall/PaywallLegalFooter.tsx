/**
 * Paywall Legal Footer Component
 * Display legal links and terms for App Store compliance
 */

import React from "react";
import { View, TouchableOpacity, Linking } from "react-native";
import { AtomicText } from "@umituz/react-native-design-system";
import { useAppDesignTokens } from "@umituz/react-native-design-system";
import type { PaywallLegalFooterProps } from "./PaywallLegalFooterTypes";
import { DEFAULT_TERMS } from "./PaywallLegalFooterTypes";
import { styles } from "./PaywallLegalFooterStyles";

export type { PaywallLegalFooterProps } from "./PaywallLegalFooterTypes";

export const PaywallLegalFooter: React.FC<PaywallLegalFooterProps> = React.memo(
  ({
    termsText = DEFAULT_TERMS,
    privacyUrl,
    termsUrl,
    privacyText = "Privacy Policy",
    termsOfServiceText = "Terms of Service",
    showRestoreButton = false,
    restoreButtonText = "Restore Purchases",
    onRestore,
    isProcessing = false,
  }) => {
    const tokens = useAppDesignTokens();

    const handlePrivacyPress = () => {
      if (privacyUrl) {
        Linking.openURL(privacyUrl).catch(() => {});
      }
    };

    const handleTermsPress = () => {
      if (termsUrl) {
        Linking.openURL(termsUrl).catch(() => {});
      }
    };

    const hasLinks = privacyUrl || termsUrl || showRestoreButton;

    return (
      <View style={styles.container}>
        <AtomicText
          type="labelSmall"
          style={[styles.termsText, { color: tokens.colors.textTertiary }]}
        >
          {termsText}
        </AtomicText>

        {hasLinks && (
          <View style={styles.legalLinksWrapper}>
            <View
              style={[
                styles.legalLinksContainer,
                { borderColor: tokens.colors.border },
              ]}
            >
              {showRestoreButton && (
                <>
                  <TouchableOpacity
                    onPress={onRestore}
                    activeOpacity={0.6}
                    style={styles.linkItem}
                    disabled={isProcessing}
                  >
                    <AtomicText
                      type="labelSmall"
                      style={[
                        styles.linkText,
                        {
                          color: tokens.colors.textSecondary,
                        },
                      ]}
                    >
                      {restoreButtonText}
                    </AtomicText>
                  </TouchableOpacity>
                  {(privacyUrl || termsUrl) && (
                    <View
                      style={[
                        styles.dot,
                        { backgroundColor: tokens.colors.border },
                      ]}
                    />
                  )}
                </>
              )}

              {privacyUrl && (
                <>
                  <TouchableOpacity
                    onPress={handlePrivacyPress}
                    activeOpacity={0.6}
                    style={styles.linkItem}
                  >
                    <AtomicText
                      type="labelSmall"
                      style={[
                        styles.linkText,
                        { color: tokens.colors.textSecondary },
                      ]}
                    >
                      {privacyText}
                    </AtomicText>
                  </TouchableOpacity>
                  {termsUrl && (
                    <View
                      style={[
                        styles.dot,
                        { backgroundColor: tokens.colors.border },
                      ]}
                    />
                  )}
                </>
              )}

              {termsUrl && (
                <TouchableOpacity
                  onPress={handleTermsPress}
                  activeOpacity={0.6}
                  style={styles.linkItem}
                >
                  <AtomicText
                    type="labelSmall"
                    style={[
                      styles.linkText,
                      { color: tokens.colors.textSecondary },
                    ]}
                  >
                    {termsOfServiceText}
                  </AtomicText>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
    );
  }
);

PaywallLegalFooter.displayName = "PaywallLegalFooter";
