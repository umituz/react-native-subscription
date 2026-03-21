import { useMemo } from "react";
import { useAuthStore, selectUserId } from "@umituz/react-native-auth";
import { collection, query, orderBy, limit } from "firebase/firestore";
import type {
  CreditLog,
  TransactionRepositoryConfig,
} from "../../domain/types/transaction.types";
import { requireFirestore } from "../../../../shared/infrastructure/firestore/collectionUtils";
import { useFirestoreCollectionRealTime } from "../../../../shared/presentation/hooks/useFirestoreRealTime";

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

/**
 * Mapper to convert Firestore document to CreditLog entity.
 */
function mapTransactionLog(doc: any, docId: string): CreditLog {
  return {
    id: docId,
    ...doc,
  } as CreditLog;
}

export function useTransactionHistory({
  config,
  limit: limitCount = 50,
}: UseTransactionHistoryParams): UseTransactionHistoryResult {
  const userId = useAuthStore(selectUserId);

  // Build collection query
  const queryRef = useMemo(() => {
    if (!userId) return null;

    const db = requireFirestore();
    const collectionPath = config.useUserSubcollection
      ? `users/${userId}/${config.collectionName}`
      : config.collectionName;

    return query(
      collection(db, collectionPath),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );
  }, [userId, config.collectionName, config.useUserSubcollection, limitCount]);

  // Use generic real-time sync hook
  const { data, isLoading, error, refetch, isEmpty } = useFirestoreCollectionRealTime(
    userId,
    queryRef,
    mapTransactionLog,
    "useTransactionHistory"
  );

  return {
    transactions: data,
    isLoading,
    error,
    refetch,
    isEmpty,
  };
}
