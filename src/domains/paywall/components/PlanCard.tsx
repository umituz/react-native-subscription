import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { AtomicText, AtomicIcon, AtomicBadge, useAppDesignTokens } from "@umituz/react-native-design-system";
import { formatPriceWithPeriod } from '../../../utils/priceUtils';
import { PlanCardProps } from "./PlanCard.types";

export const PlanCard: React.FC<PlanCardProps> = React.memo(
  ({ pkg, isSelected, onSelect, badge, creditAmount, creditsLabel }) => {
    const tokens = useAppDesignTokens();
    const title = pkg.product.title;
    const price = formatPriceWithPeriod(pkg.product.price, pkg.product.currencyCode, pkg.identifier);

    return (
      <TouchableOpacity onPress={onSelect} activeOpacity={0.7} style={styles.touchable}>
        <View style={[styles.container, { 
          backgroundColor: tokens.colors.surface, 
          borderColor: isSelected ? tokens.colors.primary : tokens.colors.border,
          borderWidth: isSelected ? 2 : 1 
        }]}>
          {badge && <View style={styles.badgeContainer}><AtomicBadge text={badge} variant="primary" size="sm" /></View>}
          <View style={styles.content}>
            <View style={styles.leftSection}>
              <View style={[styles.radio, { 
                  borderColor: isSelected ? tokens.colors.primary : tokens.colors.border,
                  backgroundColor: isSelected ? tokens.colors.primary : "transparent" 
              }]}>
                {isSelected && <AtomicIcon name="checkmark-circle-outline" customSize={12} customColor={tokens.colors.onPrimary} />}
              </View>
              <View style={styles.textSection}>
                <AtomicText type="titleSmall" style={{ color: tokens.colors.textPrimary, fontWeight: "600" }}>{title}</AtomicText>
                {creditAmount != null && creditAmount > 0 && creditsLabel && (
                  <AtomicText type="bodySmall" style={{ color: tokens.colors.textSecondary }}>{creditAmount} {creditsLabel}</AtomicText>
                )}
              </View>
            </View>
            <AtomicText type="titleMedium" style={{ color: isSelected ? tokens.colors.primary : tokens.colors.textPrimary, fontWeight: "700", fontSize: 18 }}>{price}</AtomicText>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
);

PlanCard.displayName = "PlanCard";

const styles = StyleSheet.create({
  touchable: { marginBottom: 10, marginHorizontal: 24 },
  container: { borderRadius: 16, padding: 16, position: "relative" },
  badgeContainer: { position: "absolute", top: -10, right: 16 },
  content: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  leftSection: { flexDirection: "row", alignItems: "center", flex: 1 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: "center", justifyContent: "center", marginRight: 12 },
  textSection: { flex: 1 },
});
