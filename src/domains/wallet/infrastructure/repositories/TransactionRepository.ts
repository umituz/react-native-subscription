/**
 * Transaction Repository
 *
 * Firestore operations for credit transaction logs.
 * Generic repository for use across hundreds of apps.
 */

import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  serverTimestamp,
  type Firestore,
  type QueryConstraint,
} from "firebase/firestore";
import { BaseRepository, getFirestore } from "@umituz/react-native-firebase";
import type {
  CreditLog,
  TransactionRepositoryConfig,
  TransactionQueryOptions,
  TransactionResult,
  TransactionReason,
} from "../../domain/types/transaction.types";

export class TransactionRepository extends BaseRepository {
  private config: TransactionRepositoryConfig;

  constructor(config: TransactionRepositoryConfig) {
    super();
    this.config = config;
  }

  private getCollectionRef(db: Firestore, userId: string) {
    if (this.config.useUserSubcollection) {
      return collection(db, "users", userId, this.config.collectionName);
    }
    return collection(db, this.config.collectionName);
  }

  async getTransactions(
    options: TransactionQueryOptions
  ): Promise<TransactionResult> {
    const db = getFirestore();
    if (!db) {
      return {
        success: false,
        error: { message: "Database not available", code: "DB_NOT_AVAILABLE" },
      };
    }

    try {
      const colRef = this.getCollectionRef(db, options.userId);
      const constraints: QueryConstraint[] = [];

      if (!this.config.useUserSubcollection) {
        constraints.push(where("userId", "==", options.userId));
      }

      constraints.push(orderBy("createdAt", "desc"));
      constraints.push(firestoreLimit(options.limit ?? 50));

      const q = query(colRef, ...constraints);
      const snapshot = await getDocs(q);

      const transactions: CreditLog[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          userId: data.userId || options.userId,
          change: data.change,
          reason: data.reason,
          feature: data.feature,
          jobId: data.jobId,
          packageId: data.packageId,
          subscriptionPlan: data.subscriptionPlan,
          description: data.description,
          createdAt: data.createdAt?.toMillis?.() || Date.now(),
        };
      });

      return { success: true, data: transactions };
    } catch (error) {
      if (__DEV__) {
        console.error("[TransactionRepository] Error:", error);
      }
      return {
        success: false,
        error: {
          message:
            error instanceof Error ? error.message : "Failed to get logs",
          code: "FETCH_FAILED",
        },
      };
    }
  }

  async addTransaction(
    userId: string,
    change: number,
    reason: TransactionReason,
    metadata?: Partial<CreditLog>
  ): Promise<TransactionResult<CreditLog>> {
    const db = getFirestore();
    if (!db) {
      return {
        success: false,
        error: { message: "Database not available", code: "DB_NOT_AVAILABLE" },
      };
    }

    try {
      const colRef = this.getCollectionRef(db, userId);
      const docData = {
        userId,
        change,
        reason,
        feature: metadata?.feature,
        jobId: metadata?.jobId,
        packageId: metadata?.packageId,
        subscriptionPlan: metadata?.subscriptionPlan,
        description: metadata?.description,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(colRef, docData);

      if (__DEV__) {
        console.log("[TransactionRepository] Added:", docRef.id);
      }

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
      if (__DEV__) {
        console.error("[TransactionRepository] Add error:", error);
      }
      return {
        success: false,
        error: {
          message:
            error instanceof Error ? error.message : "Failed to add log",
          code: "ADD_FAILED",
        },
      };
    }
  }
}

export function createTransactionRepository(
  config: TransactionRepositoryConfig
): TransactionRepository {
  return new TransactionRepository(config);
}
