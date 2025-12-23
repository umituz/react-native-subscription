/**
 * Paywall Feature Item Component
 * Single feature in the features list
 */

import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import {
  AtomicText,
  AtomicIcon,
  useAppDesignTokens,
  useResponsive,
} from "@umituz/react-native-design-system";

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
    const iconSize = getFontSize(18);

    const iconName = useMemo(() => {
      if (!icon) return "checkmark-circle";
      return icon;
    }, [icon]);

    return (
      <View style={styles.featureItem}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: tokens.colors.primaryLight },
          ]}
        >
          <AtomicIcon
            name={iconName}
            customSize={iconSize}
            customColor={tokens.colors.primary}
          />
        </View>
        <AtomicText
          type="bodyMedium"
          style={[styles.featureText, { color: tokens.colors.textPrimary, fontSize }]}
        >
          {text}
        </AtomicText>
      </View>
    );
  }
);

PaywallFeatureItem.displayName = "PaywallFeatureItem";

const createStyles = (spacingMult: number) =>
  StyleSheet.create({
    featureItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    iconContainer: {
      width: 32 * spacingMult,
      height: 32 * spacingMult,
      borderRadius: 16 * spacingMult,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12 * spacingMult,
    },
    featureText: {
      flex: 1,
      fontWeight: "500",
    },
  });
