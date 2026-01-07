/**
 * useWallet Hook
 *
 * Orchestration hook for wallet functionality.
 * Combines balance, transactions, and purchase state.
 */

import { useCallback, useMemo } from "react";
import {
    useCredits,
    type UseCreditsParams,
} from "../../../../presentation/hooks/useCredits";
import {
    useTransactionHistory,
    type UseTransactionHistoryParams,
} from "./useTransactionHistory";
import type { CreditLog } from "../../domain/types/transaction.types";

export interface UseWalletParams {
  userId: string | undefined;
  transactionConfig: UseTransactionHistoryParams["config"];
  transactionLimit?: number;
  enabled?: boolean;
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
  userId,
  transactionConfig,
  transactionLimit = 50,
  enabled = true,
}: UseWalletParams): UseWalletResult {
  const creditsParams: UseCreditsParams = {
    userId,
    enabled,
  };

  const transactionParams: UseTransactionHistoryParams = {
    userId,
    config: transactionConfig,
    limit: transactionLimit,
    enabled,
  };

  const {
    credits,
    isLoading: balanceLoading,
    refetch: refetchBalance,
    hasCredits,
  } = useCredits(creditsParams);

  const {
    transactions,
    isLoading: transactionsLoading,
    refetch: refetchTransactions,
  } = useTransactionHistory(transactionParams);

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
