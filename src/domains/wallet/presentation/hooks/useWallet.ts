/**
 * useWallet Hook
 *
 * Orchestration hook for wallet functionality.
 * Combines balance, transactions, and purchase state.
 */

import { useCallback, useMemo } from "react";
import { useCredits } from "../../../credits/presentation/useCredits";
import {
  useTransactionHistory,
  type UseTransactionHistoryParams,
} from "./useTransactionHistory";
import type { CreditLog } from "../../domain/types/transaction.types";

export interface UseWalletParams {
  transactionConfig: UseTransactionHistoryParams["config"];
  transactionLimit?: number;
}

export interface UseWalletResult {
  balance: number;
  balanceLoading: boolean;
  transactions: CreditLog[];
  transactionsLoading: boolean;
  hasCredits: boolean;
  refetchBalance: () => void;
  refetchTransactions: () => void;
  refetchAll: () => void;
}

export function useWallet({
  transactionConfig,
  transactionLimit = 50,
}: UseWalletParams): UseWalletResult {
  const {
    credits,
    isLoading: balanceLoading,
    refetch: refetchBalance,
    hasCredits,
  } = useCredits();

  const {
    transactions,
    isLoading: transactionsLoading,
    refetch: refetchTransactions,
  } = useTransactionHistory({
    config: transactionConfig,
    limit: transactionLimit,
  });

  const balance = useMemo(() => {
    return credits?.credits ?? 0;
  }, [credits]);

  const refetchAll = useCallback(() => {
    refetchBalance();
    refetchTransactions();
  }, [refetchBalance, refetchTransactions]);

  return {
    balance,
    balanceLoading,
    transactions,
    transactionsLoading,
    hasCredits,
    refetchBalance,
    refetchTransactions,
    refetchAll,
  };
}
