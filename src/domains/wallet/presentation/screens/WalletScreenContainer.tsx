/**
 * Wallet Screen Container
 *
 * Self-contained wallet screen.
 * Uses global config from configureWallet() - no props needed!
 *
 * Usage:
 * 1. Call configureWallet() during app init
 * 2. Use WalletScreenContainer directly in navigation
 *
 * ```tsx
 * // In init
 * configureWallet({ translations: myTranslations });
 *
 * // In navigation
 * <Stack.Screen name="Wallet" component={WalletScreenContainer} />
 * ```
 */

import React, { useMemo } from "react";
import { useNavigation } from "@react-navigation/native";
import { WalletScreen, type WalletScreenTranslations } from "./WalletScreen";
import { useWallet } from "../hooks/useWallet";
import { getWalletConfig } from "../../infrastructure/config/walletConfig";

export interface WalletScreenContainerProps {
  /** Translations (overrides global config) */
  translations?: WalletScreenTranslations;
  /** Override onBack handler (default: navigation.goBack) */
  onBack?: () => void;
  /** Custom date formatter */
  dateFormatter?: (timestamp: number) => string;
  /** Footer component */
  footer?: React.ReactNode;
}

export const WalletScreenContainer: React.FC<WalletScreenContainerProps> = ({
  translations,
  onBack,
  dateFormatter,
  footer,
}) => {
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

  const screenConfig = useMemo(
    () => ({
      balance,
      balanceLoading,
      transactions,
      transactionsLoading,
      translations: translations ?? config.translations,
      onBack: onBack ?? (() => navigation.goBack()),
      dateFormatter,
      balanceIconName: config.balanceIconName,
      footer,
    }),
    [
      balance,
      balanceLoading,
      transactions,
      transactionsLoading,
      translations,
      config,
      onBack,
      navigation,
      dateFormatter,
      footer,
    ],
  );

  return <WalletScreen config={screenConfig} />;
};

export default WalletScreenContainer;
