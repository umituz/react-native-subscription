/**
 * Paywall Feature Item Component
 * Single Responsibility: Display a single feature in the features list
 */

import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { AtomicText, AtomicIcon, useAppDesignTokens, useResponsive } from "@umituz/react-native-design-system";

interface PaywallFeatureItemProps {
  icon: string;
  text: string;
}

export const PaywallFeatureItem: React.FC<PaywallFeatureItemProps> = React.memo(
  ({ icon, text }) => {
    const tokens = useAppDesignTokens();
    const { spacingMultiplier, getFontSize } = useResponsive();

    const styles = useMemo(() => createStyles(spacingMultiplier), [spacingMultiplier]);
    const fontSize = getFontSize(15);
    const lineHeight = getFontSize(22);
    const iconSize = getFontSize(20);

    // Pass icon name directly to AtomicIcon (which uses Ionicons)
    // Do NOT capitalize, as Ionicons names are lowercase/kebab-case.
    const iconName = useMemo(() => {
      if (!icon) return "help-circle-outline";
      return icon;
    }, [icon]);

    return (
      <View style={styles.featureItem}>
        <AtomicIcon
          name={iconName}
          customSize={iconSize}
          customColor={tokens.colors.primary}
          style={styles.featureIcon}
        />
        <AtomicText
          type="bodyMedium"
          style={[styles.featureText, { color: tokens.colors.textPrimary, fontSize, lineHeight }]}
        >
          {text}
        </AtomicText>
      </View>
    );
  },
);

PaywallFeatureItem.displayName = "PaywallFeatureItem";

const createStyles = (spacingMult: number) =>
  StyleSheet.create({
    featureItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    featureIcon: {
      marginRight: 12 * spacingMult,
    },
    featureText: {
      flex: 1,
    },
  });
