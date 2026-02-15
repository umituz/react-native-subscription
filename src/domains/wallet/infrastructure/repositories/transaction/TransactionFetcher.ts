import {
  getDocs,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  type QueryConstraint,
} from "firebase/firestore";
import type {
  CreditLog,
  TransactionRepositoryConfig,
  TransactionQueryOptions,
  TransactionResult,
} from "../../../domain/types/transaction.types";
import { TransactionMapper } from "../../../domain/mappers/TransactionMapper";
import { requireFirestore, mapErrorToResult } from "../../../../../shared/infrastructure/firestore";
import { getCollectionRef } from "./CollectionBuilder";

export async function fetchTransactions(
  config: TransactionRepositoryConfig,
  options: TransactionQueryOptions
): Promise<TransactionResult> {
  try {
    const db = requireFirestore();
    const colRef = getCollectionRef(db, options.userId, config);
    const constraints: QueryConstraint[] = [];

    if (!config.useUserSubcollection) {
      constraints.push(where("userId", "==", options.userId));
    }

    constraints.push(orderBy("createdAt", "desc"));
    constraints.push(firestoreLimit(options.limit ?? 50));

    const q = query(colRef, ...constraints);
    const snapshot = await getDocs(q);

    const transactions: CreditLog[] = snapshot.docs.map((docSnap) =>
      TransactionMapper.toEntity(docSnap, options.userId)
    );

    return { success: true, data: transactions };
  } catch (error) {
    return mapErrorToResult(error);
  }
}
