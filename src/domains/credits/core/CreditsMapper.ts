import type { UserCredits } from "./Credits";
import { resolveSubscriptionStatus } from "../../subscription/core/SubscriptionStatus";
import type { PeriodType, SubscriptionStatusType } from "../../subscription/core/SubscriptionConstants";
import type { UserCreditsDocumentRead } from "./UserCreditsDocument";
import { toSafeDate } from "../../../utils/dateUtils";

/**
 * Validate subscription status against expirationDate and periodType
 */
function validateSubscription(
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

  return {
    isPremium: isExpired ? false : isPremium,
    status,
  };
}

/** 
 * Maps Firestore document to domain entity with expiration validation 
 */
export function mapCreditsDocumentToEntity(doc: UserCreditsDocumentRead): UserCredits {
  const expirationDate = toSafeDate(doc.expirationDate);
  const periodType = doc.periodType;

  const { isPremium, status } = validateSubscription(doc, expirationDate, periodType);

  return {
    isPremium,
    status,
    purchasedAt: toSafeDate(doc.purchasedAt) ?? new Date(),
    expirationDate,
    lastUpdatedAt: toSafeDate(doc.lastUpdatedAt) ?? new Date(),
    lastPurchaseAt: toSafeDate(doc.lastPurchaseAt),
    willRenew: doc.willRenew,
    productId: doc.productId,
    packageType: doc.packageType,
    originalTransactionId: doc.originalTransactionId,
    periodType,
    isTrialing: doc.isTrialing,
    trialStartDate: toSafeDate(doc.trialStartDate),
    trialEndDate: toSafeDate(doc.trialEndDate),
    trialCredits: doc.trialCredits,
    convertedFromTrial: doc.convertedFromTrial,
    credits: doc.credits,
    creditLimit: doc.creditLimit,
    purchaseSource: doc.purchaseSource,
    purchaseType: doc.purchaseType,
    platform: doc.platform,
    appVersion: doc.appVersion,
  };
}
