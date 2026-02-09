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
    useAppDesignTokens,
    AtomicText,
    AtomicIcon,
    AtomicSpinner,
} from "@umituz/react-native-design-system";
import { ScreenLayout } from "../../../../shared/presentation";
import { useNavigation } from "@react-navigation/native";
import { useWallet } from "../hooks/useWallet";
import { getWalletConfig } from "../../infrastructure/config/walletConfig";
import {
    BalanceCard,
    type BalanceCardTranslations,
} from "../components/BalanceCard";
import {
    TransactionList,
    type TransactionListTranslations,
} from "../components/TransactionList";

export interface WalletScreenTranslations
  extends BalanceCardTranslations,
    TransactionListTranslations {
  screenTitle: string;
}

export interface WalletScreenProps {
  /** Translations (overrides global config) */
  translations?: WalletScreenTranslations;
  /** Override onBack handler (default: navigation.goBack) */
  onBack?: () => void;
  /** Custom date formatter */
  dateFormatter?: (timestamp: number) => string;
  /** Footer component */
  footer?: React.ReactNode;
}

export const WalletScreen: React.FC<WalletScreenProps> = ({ 
  translations,
  onBack,
  dateFormatter,
  footer,
}) => {
  const tokens = useAppDesignTokens();
  const navigation = useNavigation();
  const config = getWalletConfig();

  const {
    balance,
    balanceLoading,
    transactions,
    transactionsLoading,
  } = useWallet({
    transactionConfig: {
      collectionName: config.transactionCollection,
      useUserSubcollection: config.useUserSubcollection,
    },
    transactionLimit: config.transactionLimit,
  });

  const activeTranslations = translations ?? config.translations;
  const handleBack = onBack ?? (() => navigation.goBack());

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: 12 }]}>
      <TouchableOpacity
        onPress={handleBack}
        style={styles.backButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <AtomicIcon
          name="arrow-left"
          size="lg"
          customColor={tokens.colors.textPrimary}
        />
      </TouchableOpacity>
      <AtomicText
        type="titleLarge"
        style={{ color: tokens.colors.textPrimary, fontWeight: "700" }}
      >
        {activeTranslations.screenTitle}
      </AtomicText>
    </View>
  );

  const renderBalance = () => {
    if (balanceLoading) {
      return (
        <AtomicSpinner
          size="xl"
          color="primary"
          text={activeTranslations.loading}
          fullContainer
          style={styles.loadingContainer}
        />
      );
    }

    return (
      <BalanceCard
        balance={balance}
        translations={activeTranslations}
        iconName={config.balanceIconName}
      />
    );
  };

  return (
    <ScreenLayout
      scrollable={true}
      edges={["top", "bottom"]}
      backgroundColor={tokens.colors.backgroundPrimary}
      contentContainerStyle={styles.content}
      footer={footer}
    >
      {renderHeader()}
      {renderBalance()}
      <TransactionList
        transactions={transactions}
        loading={transactionsLoading}
        translations={activeTranslations}
        dateFormatter={dateFormatter}
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
