import type { UserCredits, SubscriptionStatus } from "../../domain/entities/Credits";
import type { UserCreditsDocumentRead } from "../models/UserCreditsDocument";

/** Maps Firestore document to domain entity with expiration validation */
export class CreditsMapper {
  static toEntity(doc: UserCreditsDocumentRead): UserCredits {
    const expirationDate = doc.expirationDate?.toDate?.() ?? null;

    // Validate isPremium against expirationDate (real-time check)
    const { isPremium, status } = CreditsMapper.validateSubscription(doc, expirationDate);

    return {
      // Core subscription (validated)
      isPremium,
      status,

      // Dates
      purchasedAt: doc.purchasedAt?.toDate?.() ?? null,
      expirationDate,
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

  /** Validate subscription status against expirationDate */
  private static validateSubscription(
    doc: UserCreditsDocumentRead,
    expirationDate: Date | null
  ): { isPremium: boolean; status: SubscriptionStatus } {
    const docIsPremium = doc.isPremium ?? false;

    // No expiration date = lifetime or free
    if (!expirationDate) {
      return {
        isPremium: docIsPremium,
        status: docIsPremium ? "active" : "free",
      };
    }

    // Check if subscription has expired
    const isExpired = expirationDate < new Date();

    if (isExpired) {
      // Subscription expired - override document's isPremium
      return { isPremium: false, status: "expired" };
    }

    // Subscription still active
    return {
      isPremium: docIsPremium,
      status: docIsPremium ? "active" : "free",
    };
  }
}
