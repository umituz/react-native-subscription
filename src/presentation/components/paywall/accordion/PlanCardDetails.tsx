/**
 * Plan Card Details
 * Expanded state of accordion subscription card
 */

import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import {
  AtomicText,
  useAppDesignTokens,
  useResponsive,
} from "@umituz/react-native-design-system";
import type { PlanCardDetailsProps } from "./AccordionPlanCardTypes";

export const PlanCardDetails: React.FC<PlanCardDetailsProps> = ({
  fullPrice,
  monthlyEquivalent,
  periodLabel,
  isYearly,
  billingPeriodLabel = "Billing Period",
  totalPriceLabel = "Total Price",
  perMonthLabel = "Per Month",
}) => {
  const tokens = useAppDesignTokens();
  const { spacingMultiplier } = useResponsive();

  const styles = useMemo(() => createStyles(spacingMultiplier), [spacingMultiplier]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: tokens.colors.surfaceSecondary,
          borderTopColor: tokens.colors.border,
        },
      ]}
    >
      <View style={styles.row}>
        <AtomicText
          type="bodyMedium"
          style={{ color: tokens.colors.textSecondary }}
        >
          {billingPeriodLabel}
        </AtomicText>
        <AtomicText
          type="bodyMedium"
          style={{ color: tokens.colors.textPrimary, fontWeight: "600" }}
        >
          {periodLabel}
        </AtomicText>
      </View>

      {isYearly && (
        <View style={styles.row}>
          <AtomicText
            type="bodyMedium"
            style={{ color: tokens.colors.textSecondary }}
          >
            {totalPriceLabel}
          </AtomicText>
          <AtomicText
            type="bodyMedium"
            style={{
              color: tokens.colors.primary,
              fontWeight: "700",
            }}
          >
            {fullPrice}
          </AtomicText>
        </View>
      )}

      {monthlyEquivalent && (
        <View style={styles.row}>
          <AtomicText
            type="bodyMedium"
            style={{ color: tokens.colors.textSecondary }}
          >
            {perMonthLabel}
          </AtomicText>
          <AtomicText
            type="bodyMedium"
            style={{ color: tokens.colors.textPrimary, fontWeight: "600" }}
          >
            {monthlyEquivalent}
          </AtomicText>
        </View>
      )}
    </View>
  );
};

const createStyles = (spacingMult: number) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 16 * spacingMult,
      paddingVertical: 12 * spacingMult,
      borderTopWidth: 1,
      gap: 10 * spacingMult,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
  });
