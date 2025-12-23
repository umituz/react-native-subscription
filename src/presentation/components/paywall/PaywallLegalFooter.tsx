/**
 * Paywall Legal Footer Component
 * Display legal links and terms for App Store compliance
 */

import React from "react";
import { View, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { AtomicText } from "@umituz/react-native-design-system";
import { useAppDesignTokens } from "@umituz/react-native-design-system";

interface PaywallLegalFooterProps {
  termsText?: string;
  privacyUrl?: string;
  termsUrl?: string;
  privacyText?: string;
  termsOfServiceText?: string;
  showRestoreButton?: boolean;
  restoreButtonText?: string;
  onRestore?: () => void;
  isProcessing?: boolean;
}

const DEFAULT_TERMS =
  "Payment will be charged to your account. Subscription automatically renews unless cancelled.";

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

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 8,
    width: "100%",
  },
  termsText: {
    textAlign: "center",
    fontSize: 10,
    lineHeight: 14,
    marginBottom: 16,
    opacity: 0.7,
  },
  legalLinksWrapper: {
    width: "100%",
    alignItems: "center",
  },
  legalLinksContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  linkItem: {
    paddingVertical: 2,
  },
  linkText: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginHorizontal: 12,
    opacity: 0.3,
  },
});
