/**
 * Detail Row Component
 * Displays a single detail row with label and value
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import { useAppDesignTokens, AtomicText } from "@umituz/react-native-design-system";

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
      <AtomicText type="bodyMedium" style={{ color: tokens.colors.textSecondary }}>
        {label}
      </AtomicText>
      <AtomicText
        type="bodyMedium"
        style={{
          color: highlight ? tokens.colors.warning : tokens.colors.text,
          fontWeight: "500",
        }}
      >
        {value}
      </AtomicText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
