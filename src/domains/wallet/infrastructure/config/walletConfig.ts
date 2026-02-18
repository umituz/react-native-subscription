/**
 * Wallet Configuration
 *
 * Global configuration for wallet feature.
 * Set once at app init, used by WalletScreen automatically.
 */

import type { WalletScreenTranslations } from "../../presentation/screens/WalletScreen.types";


interface WalletConfiguration {
  translations: WalletScreenTranslations;
  transactionCollection: string;
  useUserSubcollection: boolean;
  transactionLimit: number;
  balanceIconName: string;
}

const DEFAULT_CONFIG: WalletConfiguration = {
  translations: {
    screenTitle: "Wallet",
    balanceLabel: "Your Balance",
    availableCredits: "Available Credits",
    title: "Transaction History",
    empty: "No transactions yet",
    loading: "Loading...",
    purchase: "Purchase",
    usage: "Usage",
    refund: "Refund",
    bonus: "Bonus",
    subscription: "Subscription",
    admin: "Admin",
    reward: "Reward",
    expired: "Expired",
  },
  transactionCollection: "credit_logs",
  useUserSubcollection: true,
  transactionLimit: 50,
  balanceIconName: "wallet",
};

let walletConfig: WalletConfiguration = { ...DEFAULT_CONFIG };

/**
 * Get current wallet configuration
 */
export function getWalletConfig(): WalletConfiguration {
  return walletConfig;
}
