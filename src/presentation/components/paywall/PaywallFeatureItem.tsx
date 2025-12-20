/**
 * Paywall Feature Item Component
 * Single Responsibility: Display a single feature in the features list
 */

import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { AtomicText, AtomicIcon } from "@umituz/react-native-design-system";
import { useAppDesignTokens } from "@umituz/react-native-design-system";

interface PaywallFeatureItemProps {
  icon: string;
  text: string;
}

export const PaywallFeatureItem: React.FC<PaywallFeatureItemProps> = React.memo(
  ({ icon, text }) => {
    const tokens = useAppDesignTokens();

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
          customSize={20}
          customColor={tokens.colors.primary}
          style={styles.featureIcon}
        />
        <AtomicText
          type="bodyMedium"
          style={[styles.featureText, { color: tokens.colors.textPrimary }]}
        >
          {text}
        </AtomicText>
      </View>
    );
  },
);

PaywallFeatureItem.displayName = "PaywallFeatureItem";

const styles = StyleSheet.create({
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureIcon: {
    marginRight: 12,
  },
  featureText: {
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
});
