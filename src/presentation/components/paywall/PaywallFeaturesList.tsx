/**
 * Paywall Features List Component
 * Displays premium features list
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import { PaywallFeatureItem } from "./PaywallFeatureItem";

interface PaywallFeaturesListProps {
  /** Features list */
  features: Array<{ icon: string; text: string }>;
  /** Optional custom container style */
  containerStyle?: object;
  /** Optional gap between items (default: 12) */
  gap?: number;
}

export const PaywallFeaturesList: React.FC<PaywallFeaturesListProps> = React.memo(
  ({ features, containerStyle, gap = 12 }) => {
    return (
      <View style={[styles.container, containerStyle]}>
        {features.map((feature, index) => (
          <View
            key={`${feature.icon}-${feature.text}-${index}`}
            style={{ marginBottom: index < features.length - 1 ? gap : 0 }}
          >
            <PaywallFeatureItem icon={feature.icon} text={feature.text} />
          </View>
        ))}
      </View>
    );
  },
);

PaywallFeaturesList.displayName = "PaywallFeaturesList";

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
});

