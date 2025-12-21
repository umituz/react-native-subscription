/**
 * Best Value Badge Component
 * Single Responsibility: Display a "Best Value" badge for subscription packages
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import { AtomicText, useAppDesignTokens } from "@umituz/react-native-design-system";

interface BestValueBadgeProps {
  text: string;
  visible?: boolean;
}

export const BestValueBadge: React.FC<BestValueBadgeProps> = React.memo(
  ({ text, visible = true }) => {
    const tokens = useAppDesignTokens();

    if (!visible) return null;

    return (
      <View
        style={[styles.badge, { backgroundColor: tokens.colors.primary }]}
      >
        <AtomicText
          type="labelSmall"
          style={{ color: tokens.colors.onPrimary, fontWeight: "700" }}
        >
          {text}
        </AtomicText>
      </View>
    );
  }
);

BestValueBadge.displayName = "BestValueBadge";

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -12,
    right: 16,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 16,
    zIndex: 1,
  },
});
