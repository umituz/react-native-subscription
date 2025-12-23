/**
 * Plan Card Details
 * Expanded state of accordion subscription card
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import {
  AtomicText,
  useAppDesignTokens,
} from "@umituz/react-native-design-system";
import { useLocalization } from "@umituz/react-native-localization";
import type { PlanCardDetailsProps } from "./AccordionPlanCardTypes";

export const PlanCardDetails: React.FC<PlanCardDetailsProps> = ({
  fullPrice,
  monthlyEquivalent,
  periodLabel,
  isYearly,
}) => {
  const tokens = useAppDesignTokens();
  const { t } = useLocalization();

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
          {t("paywall.billingPeriod") || "Billing Period"}
        </AtomicText>
        <AtomicText
          type="bodyMedium"
          style={{ color: tokens.colors.textPrimary, fontWeight: "600" }}
        >
          {t(`paywall.period.${periodLabel}`)}
        </AtomicText>
      </View>

      {isYearly && (
        <View style={styles.row}>
          <AtomicText
            type="bodyMedium"
            style={{ color: tokens.colors.textSecondary }}
          >
            {t("paywall.totalPrice") || "Total Price"}
          </AtomicText>
          <AtomicText
            type="bodyMedium"
            style={{ color: tokens.colors.textPrimary, fontWeight: "600" }}
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
            {t("paywall.perMonth") || "Per Month"}
          </AtomicText>
          <AtomicText
            type="bodyMedium"
            style={{
              color: tokens.colors.primary,
              fontWeight: "700",
            }}
          >
            {monthlyEquivalent}
          </AtomicText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
