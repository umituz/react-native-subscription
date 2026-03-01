import React from "react";
import { View } from "react-native";
import { AtomicText, AtomicIcon } from "@umituz/react-native-design-system/atoms";
import { useAppDesignTokens } from "@umituz/react-native-design-system/theme";
import type { SubscriptionFeature } from "../entities/types";
import { paywallModalStyles as styles } from "./PaywallModal.styles";

export const PaywallFeatures: React.FC<{ features: SubscriptionFeature[] }> = ({ features }) => {
  const tokens = useAppDesignTokens();
  if (!features.length) return null;

  return (
    <View style={[styles.features, { backgroundColor: tokens.colors.surfaceSecondary }]}>
      {features.map((feature) => (
        <View key={`${feature.icon}-${feature.text}`} style={styles.featureRow}>
          <View style={[styles.featureIcon, { backgroundColor: tokens.colors.primary }]}>
            <AtomicIcon name={feature.icon} customSize={16} customColor={tokens.colors.onPrimary} />
          </View>
          <AtomicText type="bodyMedium" style={[styles.featureText, { color: tokens.colors.textPrimary }]}>
            {feature.text}
          </AtomicText>
        </View>
      ))}
    </View>
  );
};
