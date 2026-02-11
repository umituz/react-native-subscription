import type { CreditLog } from "../../domain/types/transaction.types";

export interface TransactionItemTranslations {
  purchase: string;
  usage: string;
  refund: string;
  bonus: string;
  subscription: string;
  admin: string;
  reward: string;
  expired: string;
}

export interface TransactionItemProps {
  transaction: CreditLog;
  translations: TransactionItemTranslations;
  dateFormatter?: (timestamp: number) => string;
}
