/**
 * Credits Mapper
 * Maps Firestore data to UserCredits entity and vice-versa.
 */

import type { UserCredits } from "../../domain/entities/Credits";
import type { UserCreditsDocumentRead } from "../models/UserCreditsDocument";

export class CreditsMapper {
  static toEntity(snapData: UserCreditsDocumentRead): UserCredits {
    return {
      textCredits: snapData.textCredits,
      imageCredits: snapData.imageCredits,
      purchasedAt: snapData.purchasedAt?.toDate?.() || new Date(),
      lastUpdatedAt: snapData.lastUpdatedAt?.toDate?.() || new Date(),
    };
  }

  static toFirestore(data: Partial<UserCredits>): Record<string, any> {
    return {
      textCredits: data.textCredits,
      imageCredits: data.imageCredits,
      // Timestamps are usually handled by serverTimestamp() in repos, 
      // but we can map them if needed.
    };
  }
}
