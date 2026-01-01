/**
 * Transaction List Component
 *
 * Displays a list of credit transactions.
 * Props-driven for full customization.
 */

import React from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
  useAppDesignTokens,
  AtomicText,
  AtomicIcon,
} from "@umituz/react-native-design-system";
import type { CreditLog } from "../../domain/types/transaction.types";
  TransactionItem,
  type TransactionItemTranslations,
} from "./TransactionItem";

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
  maxHeight = 400,
  dateFormatter,
}) => {
  const tokens = useAppDesignTokens();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AtomicText
          type="titleLarge"
          style={[styles.title, { color: tokens.colors.textPrimary }]}
        >
          {translations.title}
        </AtomicText>
        <AtomicIcon name="History" size="md" color="secondary" />
      </View>

      {loading ? (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color={tokens.colors.primary} />
          <AtomicText
            type="bodyMedium"
            style={[styles.stateText, { color: tokens.colors.textSecondary }]}
          >
            {translations.loading}
          </AtomicText>
        </View>
      ) : transactions.length === 0 ? (
        <View style={styles.stateContainer}>
          <AtomicIcon name="Package" size="xl" color="secondary" />
          <AtomicText
            type="bodyMedium"
            style={[styles.stateText, { color: tokens.colors.textSecondary }]}
          >
            {translations.empty}
          </AtomicText>
        </View>
      ) : (
        <ScrollView
          style={[styles.scrollView, { maxHeight }]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {transactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              translations={translations}
              dateFormatter={dateFormatter}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  scrollView: {
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  stateContainer: {
    padding: 40,
    alignItems: "center",
    gap: 12,
  },
  stateText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
