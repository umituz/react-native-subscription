import { useState, useEffect } from "react";
import { useAuthStore, selectUserId } from "@umituz/react-native-auth";
import { collection, onSnapshot, query, orderBy, limit, Query } from "firebase/firestore";
import type {
  CreditLog,
  TransactionRepositoryConfig,
} from "../../domain/types/transaction.types";
import { requireFirestore } from "../../../../shared/infrastructure/firestore/collectionUtils";

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
  limit: limitCount = 50,
}: UseTransactionHistoryParams): UseTransactionHistoryResult {
  const userId = useAuthStore(selectUserId);
  const [transactions, setTransactions] = useState<CreditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setTransactions([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const db = requireFirestore();
      const collectionPath = config.useUserSubcollection
        ? `users/${userId}/${config.collectionName}`
        : config.collectionName;

      const q = query(
        collection(db, collectionPath),
        orderBy("timestamp", "desc"),
        limit(limitCount)
      ) as Query;

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const logs: CreditLog[] = [];
          snapshot.forEach((doc) => {
            logs.push({
              id: doc.id,
              ...doc.data(),
            } as CreditLog);
          });
          setTransactions(logs);
          setIsLoading(false);
        },
        (err) => {
          console.error("[useTransactionHistory] Snapshot error:", err);
          setError(err as Error);
          setIsLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("[useTransactionHistory] Setup error:", err);
      setError(error);
      setIsLoading(false);
    }
  }, [userId, config.collectionName, config.useUserSubcollection, limitCount]);

  const refetch = () => {
    if (__DEV__) {
      console.warn("[useTransactionHistory] Refetch called - not needed for real-time sync");
    }
  };

  return {
    transactions,
    isLoading,
    error,
    refetch,
    isEmpty: transactions.length === 0,
  };
}
