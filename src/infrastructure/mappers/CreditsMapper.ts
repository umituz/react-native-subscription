import type { UserCredits } from "../../domain/entities/Credits";
import type { UserCreditsDocumentRead } from "../models/UserCreditsDocument";

export class CreditsMapper {
  static toEntity(snapData: UserCreditsDocumentRead): UserCredits {
    return {
      credits: snapData.credits,
      purchasedAt: snapData.purchasedAt?.toDate?.() || null,
      lastUpdatedAt: snapData.lastUpdatedAt?.toDate?.() || null,
    };
  }

  static toFirestore(data: Partial<UserCredits>): Record<string, any> {
    return {
      credits: data.credits,
      // Timestamps are usually handled by serverTimestamp() in repos, 
      // but we can map them if needed.
    };
  }
}
