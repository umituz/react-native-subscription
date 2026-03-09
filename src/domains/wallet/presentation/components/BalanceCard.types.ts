export interface BalanceCardTranslations {
  balanceLabel: string;
  availableCredits: string;
}

export interface BalanceCardProps {
  balance: number;
  translations: BalanceCardTranslations;
  iconName?: string;
}
