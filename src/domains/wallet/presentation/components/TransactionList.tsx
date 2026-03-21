import React, { useCallback, useMemo } from "react";
import { View, FlatList } from "react-native";
import { AtomicText, AtomicIcon } from "@umituz/react-native-design-system/atoms";
import { useAppDesignTokens } from "@umituz/react-native-design-system/theme";
import { TransactionItem } from "./TransactionItem";
import { transactionListStyles } from "./TransactionList.styles";
import { LoadingState, EmptyState } from "./TransactionListStates";
import { DEFAULT_TRANSACTION_LIST_MAX_HEIGHT } from "./TransactionList.constants";
import type { TransactionListTranslations, TransactionListProps } from "./TransactionList.types";
import { isEmptyArray } from "../../../shared/utils/arrayUtils";

export type { TransactionListTranslations };

export const TransactionList: React.FC<TransactionListProps> = React.memo(({
  transactions,
  loading,
  translations,
  maxHeight = DEFAULT_TRANSACTION_LIST_MAX_HEIGHT,
  dateFormatter,
}) => {
  const tokens = useAppDesignTokens();

  const keyExtractor = useCallback((item: typeof transactions[0]) => item.id, []);
  const renderItem = useCallback(({ item }: { item: typeof transactions[0] }) => (
    <TransactionItem transaction={item} translations={translations} dateFormatter={dateFormatter} />
  ), [translations, dateFormatter]);

  const listStyle = useMemo(() => [transactionListStyles.scrollView, { maxHeight }], [maxHeight]);

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
      ) : isEmptyArray(transactions) ? (
        <EmptyState message={translations.empty} />
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          style={listStyle}
          contentContainerStyle={transactionListStyles.scrollContent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
          initialNumToRender={10}
        />
      )}
    </View>
  );
});
