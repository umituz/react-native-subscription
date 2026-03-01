import { useQuery } from "@umituz/react-native-design-system/tanstack";
import { useMemo } from "react";
import { useAuthStore, selectUserId, selectIsAnonymous } from "@umituz/react-native-auth";
import { NO_CACHE_QUERY_CONFIG } from "../../../../shared/infrastructure/react-query/queryConfig";
import type {
  CreditLog,
  TransactionRepositoryConfig,
} from "../../domain/types/transaction.types";
import { TransactionRepository } from "../../infrastructure/repositories/transaction";

const transactionQueryKeys = {
  all: ["transactions"] as const,
  user: (userId: string) => ["transactions", userId] as const,
};

export interface UseTransactionHistoryParams {
  config: TransactionRepositoryConfig;
  limit?: number;
}

interface UseTransactionHistoryResult {
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
  const isAnonymous = useAuthStore(selectIsAnonymous);

  const repository = useMemo(
    () => new TransactionRepository(config),
    [config]
  );

  const isUserRegistered = !!userId && !isAnonymous;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...transactionQueryKeys.user(userId ?? ""), limit],
    queryFn: async () => {
      if (!userId || isAnonymous) return [];

      const result = await repository.getTransactions({
        userId,
        limit,
      });

      if (!result.success) {
        throw new Error(result.error?.message || "Failed to fetch history");
      }

      return result.data ?? [];
    },
    enabled: isUserRegistered,
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
