import { addDoc } from "firebase/firestore";
import { serverTimestamp } from "@umituz/react-native-firebase";
import type {
  CreditLog,
  TransactionRepositoryConfig,
  TransactionResult,
  TransactionReason,
} from "../../../domain/types/transaction.types";
import { TransactionMapper } from "../../../domain/mappers/TransactionMapper";
import { requireFirestore, mapErrorToResult } from "../../../../../shared/infrastructure/firestore";
import { getCollectionRef } from "./CollectionBuilder";

export async function addTransaction(
  config: TransactionRepositoryConfig,
  userId: string,
  change: number,
  reason: TransactionReason,
  metadata?: Partial<CreditLog>
): Promise<TransactionResult<CreditLog>> {
  try {
    const db = requireFirestore();
    const colRef = getCollectionRef(db, userId, config);
    const docData = {
      ...TransactionMapper.toFirestore(userId, change, reason, metadata),
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(colRef, docData);

    return {
      success: true,
      data: {
        id: docRef.id,
        userId,
        change,
        reason,
        ...metadata,
        createdAt: Date.now(), // Approximate - actual server timestamp written to Firestore
      },
    };
  } catch (error) {
    return mapErrorToResult<CreditLog>(error);
  }
}
