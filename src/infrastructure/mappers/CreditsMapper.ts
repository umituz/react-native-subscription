import type { UserCredits } from "../../domain/entities/Credits";
import { resolveSubscriptionStatus, type PeriodType, type SubscriptionStatusType } from "../../domain/entities/SubscriptionStatus";
import type { UserCreditsDocumentRead } from "../models/UserCreditsDocument";

/** Maps Firestore document to domain entity with expiration validation */
export class CreditsMapper {
  static toEntity(doc: UserCreditsDocumentRead): UserCredits {
    const expirationDate = doc.expirationDate?.toDate?.() ?? null;
    const periodType = doc.periodType as PeriodType | undefined;

    // Validate isPremium against expirationDate (real-time check)
    const { isPremium, status } = CreditsMapper.validateSubscription(doc, expirationDate, periodType);

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

      // Trial fields
      periodType,
      isTrialing: doc.isTrialing,
      trialStartDate: doc.trialStartDate?.toDate?.() ?? null,
      trialEndDate: doc.trialEndDate?.toDate?.() ?? null,
      trialCredits: doc.trialCredits,
      convertedFromTrial: doc.convertedFromTrial,

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

  /** Validate subscription status against expirationDate and periodType */
  private static validateSubscription(
    doc: UserCreditsDocumentRead,
    expirationDate: Date | null,
    periodType?: PeriodType
  ): { isPremium: boolean; status: SubscriptionStatusType } {
    const isPremium = doc.isPremium ?? false;
    const willRenew = doc.willRenew ?? false;
    const isExpired = expirationDate ? expirationDate < new Date() : false;

    const status = resolveSubscriptionStatus({
      isPremium,
      willRenew,
      isExpired,
      periodType,
    });

    // Override isPremium if expired
    return {
      isPremium: isExpired ? false : isPremium,
      status,
    };
  }
}
