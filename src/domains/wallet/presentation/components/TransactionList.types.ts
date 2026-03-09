import type { CreditLog } from "../../domain/types/transaction.types";
import type { TransactionItemTranslations } from "./TransactionItem.types";

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
