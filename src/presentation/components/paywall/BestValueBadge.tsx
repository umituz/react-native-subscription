import React from "react";
import { View, StyleSheet } from "react-native";
import { AtomicText, useAppDesignTokens } from "@umituz/react-native-design-system";
import { LinearGradient } from "expo-linear-gradient";

interface BestValueBadgeProps {
  text: string;
  visible?: boolean;
}

export const BestValueBadge: React.FC<BestValueBadgeProps> = React.memo(
  ({ text, visible = true }) => {
    const tokens = useAppDesignTokens();

    if (!visible) return null;

    return (
      <View style={styles.badgeContainer}>
        <LinearGradient
          colors={[tokens.colors.secondary, tokens.colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.badge}
        >
          <AtomicText
            type="labelSmall"
            style={{ color: tokens.colors.onPrimary, fontWeight: "800", textTransform: "uppercase", fontSize: 10 }}
          >
            {text}
          </AtomicText>
        </LinearGradient>
      </View>
    );
  }
);

BestValueBadge.displayName = "BestValueBadge";

const styles = StyleSheet.create({
  badgeContainer: {
    position: "absolute",
    top: -12,
    right: 16,
    zIndex: 1,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
