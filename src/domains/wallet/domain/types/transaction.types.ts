/**
 * Transaction Types
 *
 * Types for credit transaction history and logs.
 * Generic types for use across hundreds of apps.
 */

export type TransactionReason =
  | "purchase"
  | "usage"
  | "refund"
  | "bonus"
  | "subscription"
  | "admin"
  | "reward"
  | "expired";

export interface CreditLog {
  id: string;
  userId: string;
  change: number;
  reason: TransactionReason;
  feature?: string;
  jobId?: string;
  packageId?: string;
  subscriptionPlan?: string;
  description?: string;
  createdAt: number;
}

export interface TransactionRepositoryConfig {
  collectionName: string;
  useUserSubcollection?: boolean;
}

export interface TransactionQueryOptions {
  userId: string;
  limit?: number;
  startAfter?: number;
}

export interface TransactionResult<T = CreditLog[]> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
  };
}
