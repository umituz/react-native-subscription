/**
 * Transaction Repository
 *
 * Firestore operations for credit transaction logs.
 * Generic repository for use across hundreds of apps.
 */

import {
    getDocs,
    addDoc,
    query,
    where,
    orderBy,
    limit as firestoreLimit,
    serverTimestamp,
    type QueryConstraint,
} from "firebase/firestore";
import { BaseRepository } from "@umituz/react-native-firebase";
import type {
  CreditLog,
  TransactionRepositoryConfig,
  TransactionQueryOptions,
  TransactionResult,
  TransactionReason,
} from "../../domain/types/transaction.types";
import { TransactionMapper } from "../../domain/mappers/TransactionMapper";
import { requireFirestore, buildCollectionRef, type CollectionConfig, mapErrorToResult } from "../../../../shared/infrastructure/firestore";

export class TransactionRepository extends BaseRepository {
  private config: TransactionRepositoryConfig;

  constructor(config: TransactionRepositoryConfig) {
    super();
    this.config = config;
  }

  private getCollectionConfig(): CollectionConfig {
    return {
      collectionName: this.config.collectionName,
      useUserSubcollection: this.config.useUserSubcollection ?? false,
    };
  }

  private getCollectionRef(db: any, userId: string) {
    const config = this.getCollectionConfig();
    return buildCollectionRef(db, userId, config);
  }

  async getTransactions(
    options: TransactionQueryOptions
  ): Promise<TransactionResult> {
    try {
      const db = requireFirestore();
      const colRef = this.getCollectionRef(db, options.userId);
      const constraints: QueryConstraint[] = [];

      if (!this.config.useUserSubcollection) {
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

  async addTransaction(
    userId: string,
    change: number,
    reason: TransactionReason,
    metadata?: Partial<CreditLog>
  ): Promise<TransactionResult<CreditLog>> {
    try {
      const db = requireFirestore();
      const colRef = this.getCollectionRef(db, userId);
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
          createdAt: Date.now(),
        },
      };
    } catch (error) {
      return mapErrorToResult<CreditLog>(error);
    }
  }
}

export function createTransactionRepository(
  config: TransactionRepositoryConfig
): TransactionRepository {
  return new TransactionRepository(config);
}
