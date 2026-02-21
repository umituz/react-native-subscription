import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import type { CreditLog } from "../types/transaction.types";

export class TransactionMapper {
  static toEntity(docSnap: QueryDocumentSnapshot<DocumentData>, defaultUserId: string): CreditLog {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      userId: data.userId ?? defaultUserId,
      change: data.change,
      reason: data.reason,
      feature: data.feature,
      jobId: data.jobId,
      packageId: data.packageId,
      subscriptionPlan: data.subscriptionPlan,
      description: data.description,
      createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
    };
  }

  static toFirestore(userId: string, change: number, reason: string, metadata?: Partial<CreditLog>) {
    return {
      userId,
      change,
      reason,
      feature: metadata?.feature,
      jobId: metadata?.jobId,
      packageId: metadata?.packageId,
      subscriptionPlan: metadata?.subscriptionPlan,
      description: metadata?.description,
    };
  }
}
