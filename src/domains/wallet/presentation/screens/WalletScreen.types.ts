import type { BalanceCardTranslations } from "../components/BalanceCard";
import type { TransactionListTranslations } from "../components/TransactionList";

export interface WalletScreenTranslations
  extends BalanceCardTranslations,
    TransactionListTranslations {
  screenTitle: string;
}

export interface WalletScreenProps {
  translations?: WalletScreenTranslations;
  onBack?: () => void;
  dateFormatter?: (timestamp: number) => string;
  footer?: React.ReactNode;
}
