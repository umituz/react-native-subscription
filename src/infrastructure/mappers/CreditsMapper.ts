import type { UserCredits, SubscriptionStatus } from "../../domain/entities/Credits";
import type { UserCreditsDocumentRead } from "../models/UserCreditsDocument";

/** Maps Firestore document to domain entity */
export class CreditsMapper {
  static toEntity(doc: UserCreditsDocumentRead): UserCredits {
    // Determine status from document or derive from isPremium/expirationDate
    const status = doc.status ?? CreditsMapper.deriveStatus(doc);

    return {
      // Core subscription
      isPremium: doc.isPremium ?? false,
      status,

      // Dates
      purchasedAt: doc.purchasedAt?.toDate?.() ?? null,
      expirationDate: doc.expirationDate?.toDate?.() ?? null,
      lastUpdatedAt: doc.lastUpdatedAt?.toDate?.() ?? null,

      // RevenueCat details
      willRenew: doc.willRenew ?? false,
      productId: doc.productId,
      packageType: doc.packageType,
      originalTransactionId: doc.originalTransactionId,

      // Credits
      credits: doc.credits,
      creditLimit: doc.creditLimit,

      // Metadata
      purchaseSource: doc.purchaseSource,
      purchaseType: doc.purchaseType,
      platform: doc.platform,
      appVersion: doc.appVersion,
    };
  }

  /** Derive status from isPremium and expirationDate for backward compatibility */
  private static deriveStatus(doc: UserCreditsDocumentRead): SubscriptionStatus {
    if (!doc.isPremium && !doc.expirationDate) return "free";
    if (doc.isPremium) return "active";
    if (doc.expirationDate) {
      const expDate = doc.expirationDate.toDate?.();
      if (expDate && expDate < new Date()) return "expired";
    }
    return "free";
  }
}
