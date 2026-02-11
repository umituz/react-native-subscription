import React from "react";
import { View, ScrollView } from "react-native";
import { useAppDesignTokens, AtomicText, AtomicIcon } from "@umituz/react-native-design-system";
import type { CreditLog } from "../../domain/types/transaction.types";
import { TransactionItem, type TransactionItemTranslations } from "./TransactionItem";
import { transactionListStyles } from "./TransactionList.styles";
import { LoadingState, EmptyState } from "./TransactionListStates";
import { DEFAULT_TRANSACTION_LIST_MAX_HEIGHT } from "./TransactionList.constants";

export interface TransactionListTranslations extends TransactionItemTranslations {
  title: string;
  empty: string;
  loading: string;
}

export interface TransactionListProps {
  transactions: CreditLog[];
  loading: boolean;
  translations: TransactionListTranslations;
  maxHeight?: number;
  dateFormatter?: (timestamp: number) => string;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  loading,
  translations,
  maxHeight = DEFAULT_TRANSACTION_LIST_MAX_HEIGHT,
  dateFormatter,
}) => {
  const tokens = useAppDesignTokens();

  return (
    <View style={transactionListStyles.container}>
      <View style={transactionListStyles.header}>
        <AtomicText type="titleLarge" style={[transactionListStyles.title, { color: tokens.colors.textPrimary }]}>
          {translations.title}
        </AtomicText>
        <AtomicIcon name="time-outline" size="md" color="secondary" />
      </View>

      {loading ? (
        <LoadingState message={translations.loading} />
      ) : transactions.length === 0 ? (
        <EmptyState message={translations.empty} />
      ) : (
        <ScrollView
          style={[transactionListStyles.scrollView, { maxHeight }]}
          contentContainerStyle={transactionListStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {transactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} translations={translations} dateFormatter={dateFormatter} />
          ))}
        </ScrollView>
      )}
    </View>
  );
};
