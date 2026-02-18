import React, { useMemo } from "react";
import { View } from "react-native";
import { useAppDesignTokens, AtomicText, AtomicIcon } from "@umituz/react-native-design-system";
import { getTransactionIcon } from "../../utils/transactionIconMap";
import { transactionItemStyles } from "./TransactionItem.styles";
import type { TransactionItemProps } from "./TransactionItem.types";
import { defaultDateFormatter, getReasonLabel, getChangePrefix } from "./transactionItemHelpers";

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  translations,
  dateFormatter = defaultDateFormatter,
}) => {
  const tokens = useAppDesignTokens();

  const reasonLabel = useMemo(() => getReasonLabel(transaction.reason, translations), [transaction.reason, translations]);

  const isPositive = transaction.change > 0;
  const changeColor = isPositive ? tokens.colors.success : tokens.colors.error;
  const changePrefix = getChangePrefix(transaction.change);
  const iconName = getTransactionIcon(transaction.reason);

  return (
    <View style={[transactionItemStyles.container, { backgroundColor: tokens.colors.surfaceSecondary }]}>
      <View style={[transactionItemStyles.iconContainer, { backgroundColor: tokens.colors.surface }]}>
        <AtomicIcon name={iconName} size="md" color="secondary" />
      </View>
      <View style={transactionItemStyles.content}>
        <AtomicText type="bodyMedium" style={[transactionItemStyles.reason, { color: tokens.colors.textPrimary }]}>
          {reasonLabel}
        </AtomicText>
        {transaction.description && (
          <AtomicText type="bodySmall" style={{ color: tokens.colors.textSecondary }} numberOfLines={1}>
            {transaction.description}
          </AtomicText>
        )}
        <AtomicText type="bodySmall" style={{ color: tokens.colors.textSecondary }}>
          {dateFormatter(transaction.createdAt)}
        </AtomicText>
      </View>
      <AtomicText type="titleMedium" style={[transactionItemStyles.change, { color: changeColor }]}>
        {changePrefix}{transaction.change}
      </AtomicText>
    </View>
  );
};
