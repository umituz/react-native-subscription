import type { UserCredits } from "./Credits";
import { resolveSubscriptionStatus } from "../../subscription/core/SubscriptionStatus";
import type { PeriodType, SubscriptionStatusType } from "../../subscription/core/SubscriptionConstants";
import type { UserCreditsDocumentRead } from "./UserCreditsDocument";

/** Maps Firestore document to domain entity with expiration validation */
export class CreditsMapper {
  static toEntity(doc: UserCreditsDocumentRead): UserCredits {
    const safeDate = (ts: any): Date | null => {
        if (!ts) return null;
        if (typeof ts.toDate === "function") return ts.toDate();
        if (ts instanceof Date) return ts;
        return null;
    };

    const expirationDate = safeDate(doc.expirationDate);
    const periodType = doc.periodType;

    // Validate isPremium against expirationDate (real-time check)
    const { isPremium, status } = CreditsMapper.validateSubscription(doc, expirationDate, periodType);

    return {
      // Core subscription (validated)
      isPremium,
      status,

      // Dates
      purchasedAt: safeDate(doc.purchasedAt) ?? new Date(),
      expirationDate,
      lastUpdatedAt: safeDate(doc.lastUpdatedAt) ?? new Date(),
      lastPurchaseAt: safeDate(doc.lastPurchaseAt),

      // RevenueCat details
      willRenew: doc.willRenew,
      productId: doc.productId,
      packageType: doc.packageType,
      originalTransactionId: doc.originalTransactionId,

      // Trial fields
      periodType,
      isTrialing: doc.isTrialing,
      trialStartDate: safeDate(doc.trialStartDate),
      trialEndDate: safeDate(doc.trialEndDate),
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
    periodType: PeriodType | null
  ): { isPremium: boolean; status: SubscriptionStatusType } {
    const isPremium = doc.isPremium;
    const willRenew = doc.willRenew ?? false;
    const isExpired = expirationDate ? expirationDate < new Date() : false;

    const status = resolveSubscriptionStatus({
      isPremium,
      willRenew,
      isExpired,
      periodType: periodType ?? undefined,
    });

    // Override isPremium if expired
    return {
      isPremium: isExpired ? false : isPremium,
      status,
    };
  }
}
