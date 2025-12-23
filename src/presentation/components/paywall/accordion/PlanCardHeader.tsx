/**
 * Plan Card Header
 * Header for accordion subscription card
 */

import React, { useMemo } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import {
  AtomicText,
  AtomicIcon,
  useAppDesignTokens,
  withAlpha,
  useResponsive,
} from "@umituz/react-native-design-system";
import { BestValueBadge } from "../BestValueBadge";
import { useLocalization } from "@umituz/react-native-localization";
import type { PlanCardHeaderProps } from "./AccordionPlanCardTypes";

export const PlanCardHeader: React.FC<PlanCardHeaderProps> = ({
  title,
  price,
  creditAmount,
  isSelected,
  isBestValue,
  onToggle,
}) => {
  const tokens = useAppDesignTokens();
  const { t } = useLocalization();
  const { spacingMultiplier, getFontSize, minTouchTarget } = useResponsive();

  const styles = useMemo(
    () => createStyles(spacingMultiplier, minTouchTarget),
    [spacingMultiplier, minTouchTarget]
  );
  const creditFontSize = getFontSize(11);

  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.7}
      style={styles.container}
    >
      <BestValueBadge text={t("paywall.bestValue")} visible={isBestValue} />

      <View style={styles.content}>
        <View style={styles.leftSection}>
          <View
            style={[
              styles.radio,
              {
                borderColor: isSelected ? tokens.colors.primary : tokens.colors.border,
                backgroundColor: isSelected ? tokens.colors.primary : "transparent",
              },
            ]}
          >
            {isSelected && (
              <AtomicIcon name="checkmark" customSize={14} customColor={tokens.colors.onPrimary} />
            )}
          </View>

          <View style={styles.textContainer}>
            <AtomicText
              type="titleSmall"
              style={{ color: tokens.colors.textPrimary, fontWeight: "600" }}
            >
              {title}
            </AtomicText>
            {creditAmount && (
              <View
                style={[
                  styles.creditBadge,
                  {
                    backgroundColor: withAlpha(tokens.colors.primary, 0.15),
                    borderColor: withAlpha(tokens.colors.primary, 0.3),
                  },
                ]}
              >
                <AtomicIcon name="flash" customSize={creditFontSize} customColor={tokens.colors.primary} />
                <AtomicText
                  type="labelSmall"
                  style={{
                    color: tokens.colors.primary,
                    fontWeight: "700",
                    fontSize: creditFontSize,
                    marginLeft: 4,
                  }}
                >
                  {creditAmount} {t("paywall.credits")}
                </AtomicText>
              </View>
            )}
          </View>
        </View>

        <View style={styles.rightSection}>
          <AtomicText
            type="titleMedium"
            style={{ color: tokens.colors.textPrimary, fontWeight: "700" }}
          >
            {price}
          </AtomicText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (spacingMult: number, touchTarget: number) => {
  const radioSize = Math.max(touchTarget * 0.4, 22);

  return StyleSheet.create({
    container: {
      width: "100%",
    },
    content: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 16 * spacingMult,
      paddingHorizontal: 16 * spacingMult,
    },
    leftSection: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    radio: {
      width: radioSize,
      height: radioSize,
      borderRadius: radioSize / 2,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12 * spacingMult,
    },
    textContainer: {
      flex: 1,
      gap: 6 * spacingMult,
    },
    creditBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8 * spacingMult,
      paddingVertical: 4 * spacingMult,
      borderRadius: 12 * spacingMult,
      borderWidth: 1,
      alignSelf: "flex-start",
    },
    rightSection: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12 * spacingMult,
    },
  });
};
