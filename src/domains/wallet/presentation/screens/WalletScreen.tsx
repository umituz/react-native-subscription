/**
 * Wallet Screen
 *
 * Generic wallet screen composition.
 * Props-driven for full customization across apps.
 * No business logic - pure presentation.
 */

import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import {
    useSafeAreaInsets,
    useAppDesignTokens,
    AtomicText,
    AtomicIcon,
    AtomicSpinner,
    ScreenLayout,
} from "@umituz/react-native-design-system";
import {
    BalanceCard,
    type BalanceCardTranslations,
} from "../components/BalanceCard";
import {
    TransactionList,
    type TransactionListTranslations,
} from "../components/TransactionList";
import type { CreditLog } from "../../domain/types/transaction.types";

export interface WalletScreenTranslations
  extends BalanceCardTranslations,
    TransactionListTranslations {
  screenTitle: string;
}

export interface WalletScreenConfig {
  balance: number;
  balanceLoading: boolean;
  transactions: CreditLog[];
  transactionsLoading: boolean;
  translations: WalletScreenTranslations;
  onBack?: () => void;
  dateFormatter?: (timestamp: number) => string;
  maxTransactionHeight?: number;
  balanceIconName?: string;
  footer?: React.ReactNode;
}

export interface WalletScreenProps {
  config: WalletScreenConfig;
}

export const WalletScreen: React.FC<WalletScreenProps> = ({ config }) => {
  const tokens = useAppDesignTokens();
  const insets = useSafeAreaInsets();

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      {config.onBack && (
        <TouchableOpacity
          onPress={config.onBack}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <AtomicIcon
            name="arrow-left"
            size="lg"
            customColor={tokens.colors.textPrimary}
          />
        </TouchableOpacity>
      )}
      <AtomicText
        type="titleLarge"
        style={{ color: tokens.colors.textPrimary, fontWeight: "700" }}
      >
        {config.translations.screenTitle}
      </AtomicText>
    </View>
  );

  const renderBalance = () => {
    if (config.balanceLoading) {
      return (
        <AtomicSpinner
          size="xl"
          color="primary"
          text={config.translations.loading}
          fullContainer
          style={styles.loadingContainer}
        />
      );
    }

    return (
      <BalanceCard
        balance={config.balance}
        translations={config.translations}
        iconName={config.balanceIconName}
      />
    );
  };

  return (
    <ScreenLayout
      scrollable={true}
      edges={["bottom"]}
      backgroundColor={tokens.colors.backgroundPrimary}
      contentContainerStyle={styles.content}
      footer={config.footer}
    >
      {renderHeader()}
      {renderBalance()}
      <TransactionList
        transactions={config.transactions}
        loading={config.transactionsLoading}
        translations={config.translations}
        maxHeight={config.maxTransactionHeight}
        dateFormatter={config.dateFormatter}
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    marginRight: 16,
  },
  loadingContainer: {
    minHeight: 200,
  },
});
