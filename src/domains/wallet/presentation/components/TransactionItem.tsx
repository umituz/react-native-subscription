/**
 * Transaction Item Component
 *
 * Displays a single credit transaction.
 * Props-driven for full customization.
 */

import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import {
    useAppDesignTokens,
    AtomicText,
    AtomicIcon,
} from "@umituz/react-native-design-system";
import type { CreditLog, TransactionReason } from "../../domain/types/transaction.types";

export interface TransactionItemTranslations {
  purchase: string;
  usage: string;
  refund: string;
  bonus: string;
  subscription: string;
  admin: string;
  reward: string;
  expired: string;
}

export interface TransactionItemProps {
  transaction: CreditLog;
  translations: TransactionItemTranslations;
  dateFormatter?: (timestamp: number) => string;
}

const getReasonIcon = (reason: TransactionReason): string => {
  const iconMap: Record<TransactionReason, string> = {
    purchase: "shopping-cart",
    usage: "zap",
    refund: "rotate-ccw",
    bonus: "gift",
    subscription: "star",
    admin: "shield",
    reward: "award",
    expired: "clock",
  };
  return iconMap[reason] || "circle";
};

const defaultDateFormatter = (timestamp: number): string => {
  const date = new Date(timestamp);
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  const th = String(date.getHours()).padStart(2, '0');
  const tm = String(date.getMinutes()).padStart(2, '0');
  
  return `${d}.${m}.${y} ${th}:${tm}`;
};

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  translations,
  dateFormatter = defaultDateFormatter,
}) => {
  const tokens = useAppDesignTokens();

  const reasonLabel = useMemo(() => {
    return translations[transaction.reason] || transaction.reason;
  }, [transaction.reason, translations]);

  const isPositive = transaction.change > 0;
  const changeColor = isPositive ? tokens.colors.success : tokens.colors.error;
  const changePrefix = isPositive ? "+" : "";
  const iconName = getReasonIcon(transaction.reason);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: tokens.colors.surfaceSecondary },
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: tokens.colors.surface },
        ]}
      >
        <AtomicIcon name={iconName} size="md" color="secondary" />
      </View>
      <View style={styles.content}>
        <AtomicText
          type="bodyMedium"
          style={[styles.reason, { color: tokens.colors.textPrimary }]}
        >
          {reasonLabel}
        </AtomicText>
        {transaction.description && (
          <AtomicText
            type="bodySmall"
            style={{ color: tokens.colors.textSecondary }}
            numberOfLines={1}
          >
            {transaction.description}
          </AtomicText>
        )}
        <AtomicText
          type="bodySmall"
          style={{ color: tokens.colors.textSecondary }}
        >
          {dateFormatter(transaction.createdAt)}
        </AtomicText>
      </View>
      <AtomicText
        type="titleMedium"
        style={[styles.change, { color: changeColor }]}
      >
        {changePrefix}
        {transaction.change}
      </AtomicText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  reason: {
    fontWeight: "600",
  },
  change: {
    fontWeight: "700",
    marginLeft: 12,
  },
});
