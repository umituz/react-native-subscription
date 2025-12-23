import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { AtomicText, useAppDesignTokens, useResponsive } from "@umituz/react-native-design-system";
import { LinearGradient } from "expo-linear-gradient";

interface BestValueBadgeProps {
  text: string;
  visible?: boolean;
}

export const BestValueBadge: React.FC<BestValueBadgeProps> = React.memo(
  ({ text, visible = true }) => {
    const tokens = useAppDesignTokens();
    const { spacingMultiplier, getFontSize } = useResponsive();

    const styles = useMemo(() => createStyles(spacingMultiplier), [spacingMultiplier]);
    const fontSize = getFontSize(10);

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
            style={{ color: tokens.colors.onPrimary, fontWeight: "800", textTransform: "uppercase", fontSize }}
          >
            {text}
          </AtomicText>
        </LinearGradient>
      </View>
    );
  }
);

BestValueBadge.displayName = "BestValueBadge";

const createStyles = (spacingMult: number) =>
  StyleSheet.create({
    badgeContainer: {
      position: "absolute",
      top: -12 * spacingMult,
      right: 16 * spacingMult,
      zIndex: 1,
      alignSelf: "flex-end",
    },
    badge: {
      paddingHorizontal: 16 * spacingMult,
      paddingVertical: 6 * spacingMult,
      borderRadius: 16 * spacingMult,
      alignItems: "center",
      justifyContent: "center",
    },
  });
