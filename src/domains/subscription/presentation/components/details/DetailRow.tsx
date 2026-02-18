/**
 * Detail Row Component
 * Displays a single detail row with label and value
 */

import React from "react";
import { View, StyleSheet, type ViewStyle, type TextStyle } from "react-native";
import { useAppDesignTokens, AtomicText } from "@umituz/react-native-design-system";

interface DetailRowProps {
  label: string;
  value: string;
  highlight?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  valueStyle?: TextStyle;
}

export const DetailRow: React.FC<DetailRowProps> = ({
  label,
  value,
  highlight = false,
  style,
  labelStyle,
  valueStyle,
}) => {
  const tokens = useAppDesignTokens();

  return (
    <View style={[styles.container, style]}>
      <AtomicText 
        type="bodyMedium" 
        style={[{ color: tokens.colors.textSecondary }, labelStyle]}
      >
        {label}
      </AtomicText>
      <AtomicText
        type="bodyMedium"
        style={[
          {
            color: highlight ? tokens.colors.warning : tokens.colors.textPrimary,
            fontWeight: "500",
          },
          valueStyle,
        ]}
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
