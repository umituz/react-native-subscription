import React from "react";
import { View } from "react-native";
import { AtomicText, AtomicIcon } from "@umituz/react-native-design-system/atoms";
import { useAppDesignTokens } from "@umituz/react-native-design-system/theme";
import type { SubscriptionFeature } from "../entities/types";
import { paywallScreenStyles as styles } from "./PaywallScreen.styles";
import { isEmptyArray } from "../../../shared/utils/arrayUtils";

export const PaywallFeatures: React.FC<{ features: SubscriptionFeature[] }> = React.memo(({ features }) => {
  const tokens = useAppDesignTokens();
  if (isEmptyArray(features)) return null;

  return (
    <View style={[styles.featuresContainer, { backgroundColor: tokens.colors.surfaceSecondary }]}>
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
});
