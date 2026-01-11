/**
 * useTransactionHistory Hook
 *
 * TanStack Query hook for fetching credit transaction history.
 * Generic and reusable - uses config from TransactionRepository.
 */

import { useQuery } from "@umituz/react-native-design-system";
import type {
  CreditLog,
  TransactionRepositoryConfig,
} from "../../domain/types/transaction.types";
import { TransactionRepository } from "../../infrastructure/repositories/TransactionRepository";

const CACHE_CONFIG = {
  staleTime: 60 * 1000, // 1 minute
  gcTime: 5 * 60 * 1000, // 5 minutes
};

export const transactionQueryKeys = {
  all: ["transactions"] as const,
  user: (userId: string) => ["transactions", userId] as const,
};

export interface UseTransactionHistoryParams {
  userId: string | undefined;
  config: TransactionRepositoryConfig;
  limit?: number;
  enabled?: boolean;
}

export interface UseTransactionHistoryResult {
  transactions: CreditLog[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  isEmpty: boolean;
}

export function useTransactionHistory({
  userId,
  config,
  limit = 50,
  enabled = true,
}: UseTransactionHistoryParams): UseTransactionHistoryResult {
  const repository = new TransactionRepository(config);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...transactionQueryKeys.user(userId ?? ""), limit],
    queryFn: async () => {
      if (!userId) return [];

      const result = await repository.getTransactions({
        userId,
        limit,
      });

      if (!result.success) {
        throw new Error(result.error?.message || "Failed to fetch history");
      }

      return result.data ?? [];
    },
    enabled: enabled && !!userId,
    staleTime: CACHE_CONFIG.staleTime,
    gcTime: CACHE_CONFIG.gcTime,
  });

  const transactions = data ?? [];

  if (__DEV__) {
    console.log("[useTransactionHistory] State", {
      userId,
      enabled,
      isLoading,
      count: transactions.length,
    });
  }

  return {
    transactions,
    isLoading,
    error: error as Error | null,
    refetch,
    isEmpty: transactions.length === 0,
  };
}
