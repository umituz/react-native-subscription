import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { AtomicText, AtomicIcon, AtomicSpinner } from "@umituz/react-native-design-system/atoms";
import { useAppDesignTokens } from "@umituz/react-native-design-system/theme";
import { ScreenLayout } from "../../../../shared/presentation";
import { useNavigation } from "@react-navigation/native";
import { useWallet } from "../hooks/useWallet";
import { getWalletConfig } from "../../infrastructure/config/walletConfig";
import { BalanceCard } from "../components/BalanceCard";
import { TransactionList } from "../components/TransactionList";
import { WalletScreenProps } from "./WalletScreen.types";

export const WalletScreen: React.FC<WalletScreenProps> = ({ translations, onBack, dateFormatter, footer }) => {
  const tokens = useAppDesignTokens();
  const navigation = useNavigation();
  const config = getWalletConfig();

  const { balance, balanceLoading, transactions, transactionsLoading } = useWallet({
    transactionConfig: {
      collectionName: config.transactionCollection,
      useUserSubcollection: config.useUserSubcollection,
    },
    transactionLimit: config.transactionLimit,
  });

  const activeTranslations = translations ?? config.translations;
  const handleBack = onBack ?? (() => navigation.goBack());

  return (
    <ScreenLayout
      scrollable={true}
      edges={["top", "bottom"]}
      backgroundColor={tokens.colors.backgroundPrimary}
      contentContainerStyle={styles.content}
      footer={footer}
    >
      <View style={[styles.header, { paddingTop: 12 }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <AtomicIcon name="arrow-left" size="lg" customColor={tokens.colors.textPrimary} />
        </TouchableOpacity>
        <AtomicText type="titleLarge" style={{ color: tokens.colors.textPrimary, fontWeight: "700" }}>
          {activeTranslations.screenTitle}
        </AtomicText>
      </View>

      {balanceLoading ? (
        <AtomicSpinner size="xl" color="primary" text={activeTranslations.loading} fullContainer style={styles.loadingContainer} />
      ) : (
        <BalanceCard balance={balance} translations={activeTranslations} iconName={config.balanceIconName} />
      )}

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
  content: { paddingBottom: 24 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12 },
  backButton: { marginRight: 16 },
  loadingContainer: { minHeight: 200 },
});
