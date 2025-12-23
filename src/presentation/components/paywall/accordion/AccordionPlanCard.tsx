/**
 * Accordion Plan Card
 * Expandable subscription plan card with credit display
 */

import React, { useCallback, useMemo } from "react";
import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useAppDesignTokens, useResponsive } from "@umituz/react-native-design-system";
import { formatPrice } from "../../../../utils/priceUtils";
import { getPeriodLabel, isYearlyPackage } from "../../../../utils/packagePeriodUtils";
import { useLocalization } from "@umituz/react-native-localization";
import { PlanCardHeader } from "./PlanCardHeader";
import { PlanCardDetails } from "./PlanCardDetails";
import type { AccordionPlanCardProps } from "./AccordionPlanCardTypes";

export const AccordionPlanCard: React.FC<AccordionPlanCardProps> = React.memo(
  ({
    package: pkg,
    isSelected,
    isExpanded,
    onSelect,
    onToggleExpand,
    isBestValue = false,
    creditAmount,
    billingPeriodLabel,
    totalPriceLabel,
    perMonthLabel,
  }) => {
    const tokens = useAppDesignTokens();
    const { t } = useLocalization();
    const { spacingMultiplier } = useResponsive();

    const styles = useMemo(() => createStyles(spacingMultiplier), [spacingMultiplier]);

    const period = pkg.product.subscriptionPeriod;
    const isYearly = isYearlyPackage(pkg);
    const periodLabel = getPeriodLabel(period);
    const price = formatPrice(pkg.product.price, pkg.product.currencyCode);
    const monthlyEquivalent = isYearly
      ? formatPrice(pkg.product.price / 12, pkg.product.currencyCode)
      : null;

    const title = pkg.product.title || t(`paywall.period.${periodLabel}`);
    const displayPrice = price;

    const handleHeaderPress = useCallback(() => {
      onSelect();
      if (!isExpanded) {
        onToggleExpand();
      }
    }, [onSelect, onToggleExpand, isExpanded]);

    const containerStyle: StyleProp<ViewStyle> = [
      styles.container,
      {
        borderColor: isSelected
          ? tokens.colors.primary
          : tokens.colors.borderLight,
        borderWidth: isSelected ? 2 : 1,
        backgroundColor: tokens.colors.surface,
      },
    ];

    return (
      <View style={containerStyle}>
        <PlanCardHeader
          title={title}
          price={displayPrice}
          creditAmount={creditAmount}
          isSelected={isSelected}
          isExpanded={isExpanded}
          isBestValue={isBestValue}
          onToggle={handleHeaderPress}
        />

        {isExpanded && (
          <PlanCardDetails
            fullPrice={price}
            monthlyEquivalent={monthlyEquivalent}
            periodLabel={periodLabel}
            isYearly={isYearly}
            billingPeriodLabel={billingPeriodLabel}
            totalPriceLabel={totalPriceLabel}
            perMonthLabel={perMonthLabel}
          />
        )}
      </View>
    );
  }
);

AccordionPlanCard.displayName = "AccordionPlanCard";

const createStyles = (spacingMult: number) =>
  StyleSheet.create({
    container: {
      borderRadius: 16 * spacingMult,
      marginBottom: 12 * spacingMult,
    },
  });
