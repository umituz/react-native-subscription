/**
 * Detail Row Component
 * Displays a single detail row with label and value
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAppDesignTokens } from "@umituz/react-native-design-system";

export interface DetailRowProps {
  label: string;
  value: string;
  highlight?: boolean;
}

export const DetailRow: React.FC<DetailRowProps> = ({
  label,
  value,
  highlight = false,
}) => {
  const tokens = useAppDesignTokens();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: tokens.colors.textSecondary }]}>
        {label}
      </Text>
      <Text
        style={[
          styles.value,
          { color: highlight ? tokens.colors.warning : tokens.colors.text },
        ]}
      >
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: "500",
  },
});
