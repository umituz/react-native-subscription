import { serverTimestamp } from "@umituz/react-native-firebase";
import { resolveSubscriptionStatus } from "../../subscription/core/SubscriptionStatus";
import { creditAllocationOrchestrator } from "./credit-strategies/CreditAllocationOrchestrator";
import { isPast } from "../../../utils/dateUtils";
import { isCreditPackage } from "../../../utils/packageTypeDetector";
import { toTimestamp } from "../../../shared/utils/dateConverter";
import {
  CalculateCreditsParams,
  BuildCreditsDataParams
} from "./creditOperationUtils.types";
import { PURCHASE_ID_PREFIXES, PROCESSED_PURCHASES_WINDOW } from "../core/CreditsConstants";


export function calculateNewCredits({ metadata, existingData, creditLimit, purchaseId }: CalculateCreditsParams): number {
  const isExpired = metadata.expirationDate ? isPast(metadata.expirationDate) : false;
  const isPremium = metadata.isPremium;
  const status = resolveSubscriptionStatus({
    isPremium,
    willRenew: metadata.willRenew ?? false,
    isExpired,
    periodType: metadata.periodType ?? undefined,
  });

  return creditAllocationOrchestrator.allocate({
    status,
    existingData,
    creditLimit,
    isSubscriptionActive: isPremium && !isExpired,
    productId: metadata.productId ?? null,
  });
}

export function buildCreditsData({
  existingData, newCredits, creditLimit, purchaseId, metadata, purchaseHistory, platform
}: BuildCreditsDataParams): Record<string, unknown> {
  const productId = metadata.productId ?? null;
  const isConsumable = productId ? isCreditPackage(productId) : false;
  const isPremium = isConsumable ? (existingData?.isPremium ?? metadata.isPremium) : metadata.isPremium;
  const isExpired = metadata.expirationDate ? isPast(metadata.expirationDate) : false;
  const resolvedCreditLimit = isConsumable
    ? (existingData?.creditLimit ?? creditLimit)
    : creditLimit;

  const status = resolveSubscriptionStatus({
    isPremium,
    willRenew: metadata.willRenew ?? false,
    isExpired,
    periodType: metadata.periodType ?? undefined,
  });

  const isPurchaseOrRenewal = purchaseId.startsWith(PURCHASE_ID_PREFIXES.PURCHASE) ||
                              purchaseId.startsWith(PURCHASE_ID_PREFIXES.RENEWAL);

  const expirationTimestamp = metadata.expirationDate ? toTimestamp(metadata.expirationDate) : null;
  const canceledAtTimestamp = metadata.unsubscribeDetectedAt ? toTimestamp(metadata.unsubscribeDetectedAt) : null;
  const billingIssueTimestamp = metadata.billingIssueDetectedAt ? toTimestamp(metadata.billingIssueDetectedAt) : null;

  return {
    isPremium,
    status,
    credits: newCredits,
    creditLimit: resolvedCreditLimit,
    lastUpdatedAt: serverTimestamp(),
    processedPurchases: [...(existingData?.processedPurchases ?? []), purchaseId].slice(-PROCESSED_PURCHASES_WINDOW),
    productId,
    platform,
    ...(purchaseHistory.length > 0 && { purchaseHistory }),
    ...(isPurchaseOrRenewal && { lastPurchaseAt: serverTimestamp() }),
    ...(expirationTimestamp && { expirationDate: expirationTimestamp }),
    ...(metadata.willRenew !== undefined && { willRenew: metadata.willRenew }),
    ...(metadata.originalTransactionId && { originalTransactionId: metadata.originalTransactionId }),
    ...(canceledAtTimestamp && { canceledAt: canceledAtTimestamp }),
    ...(billingIssueTimestamp && { billingIssueDetectedAt: billingIssueTimestamp }),
    ...(metadata.store && { store: metadata.store }),
    ...(metadata.ownershipType && { ownershipType: metadata.ownershipType }),
  };
}
