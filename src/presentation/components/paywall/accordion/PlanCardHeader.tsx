/**
 * Plan Card Header
 * Collapsed state of accordion subscription card
 */

import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import {
  AtomicText,
  AtomicIcon,
  useAppDesignTokens,
  withAlpha,
} from "@umituz/react-native-design-system";
import { BestValueBadge } from "../BestValueBadge";
import { useLocalization } from "@umituz/react-native-localization";
import type { PlanCardHeaderProps } from "./AccordionPlanCardTypes";

export const PlanCardHeader: React.FC<PlanCardHeaderProps> = ({
  title,
  price,
  creditAmount,
  isSelected,
  isExpanded,
  isBestValue,
  onToggle,
}) => {
  const tokens = useAppDesignTokens();
  const { t } = useLocalization();

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
                borderColor: isSelected
                  ? tokens.colors.primary
                  : tokens.colors.border,
              },
            ]}
          >
            {isSelected && (
              <View
                style={[
                  styles.radioInner,
                  { backgroundColor: tokens.colors.primary },
                ]}
              />
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
                <AtomicText
                  type="labelSmall"
                  style={{
                    color: tokens.colors.primary,
                    fontWeight: "700",
                    fontSize: 11,
                  }}
                >
                  {creditAmount} {t("paywall.credits") || "Credits"}
                </AtomicText>
              </View>
            )}
          </View>
        </View>

        <View style={styles.rightSection}>
          <AtomicText
            type="titleMedium"
            style={{
              color: tokens.colors.textPrimary,
              fontWeight: "700",
            }}
          >
            {price}
          </AtomicText>
          <View style={styles.expandIconContainer}>
            <AtomicIcon
              name={isExpanded ? "caret-up" : "caret-down"}
              size={18}
              color={tokens.colors.textSecondary as any}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  textContainer: {
    flex: 1,
    gap: 6,
  },
  creditBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  expandIconContainer: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
