import { useQuery } from "@umituz/react-native-design-system";
import { useMemo } from "react";
import { useAuthStore, selectUserId } from "@umituz/react-native-auth";
import { NO_CACHE_QUERY_CONFIG } from "../../../../shared/infrastructure/react-query/queryConfig";
import type {
  CreditLog,
  TransactionRepositoryConfig,
} from "../../domain/types/transaction.types";
import { TransactionRepository } from "../../infrastructure/repositories/transaction";

export const transactionQueryKeys = {
  all: ["transactions"] as const,
  user: (userId: string) => ["transactions", userId] as const,
};

export interface UseTransactionHistoryParams {
  config: TransactionRepositoryConfig;
  limit?: number;
}

export interface UseTransactionHistoryResult {
  transactions: CreditLog[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  isEmpty: boolean;
}

export function useTransactionHistory({
  config,
  limit = 50,
}: UseTransactionHistoryParams): UseTransactionHistoryResult {
  const userId = useAuthStore(selectUserId);

  const repository = useMemo(
    () => new TransactionRepository(config),
    [config]
  );

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
    enabled: !!userId,
    ...NO_CACHE_QUERY_CONFIG,
  });

  const transactions = data ?? [];

  return {
    transactions,
    isLoading,
    error: error as Error | null,
    refetch,
    isEmpty: transactions.length === 0,
  };
}
