import { Timestamp, serverTimestamp } from "firebase/firestore";
import { resolveSubscriptionStatus } from "../../subscription/core/SubscriptionStatus";
import { creditAllocationOrchestrator } from "./credit-strategies/CreditAllocationOrchestrator";
import { isPast } from "../../../utils";
import { 
  CalculateCreditsParams, 
  BuildCreditsDataParams 
} from "./creditOperationUtils.types";

export function calculateNewCredits({ metadata, existingData, creditLimit, purchaseId }: CalculateCreditsParams): number {
  const isPremium = metadata.isPremium;
  const isExpired = metadata.expirationDate ? isPast(metadata.expirationDate) : false;
  const status = resolveSubscriptionStatus({
    isPremium,
    willRenew: metadata.willRenew ?? false,
    isExpired,
    periodType: metadata.periodType ?? undefined,
  });
  const isStatusSync = purchaseId.startsWith("status_sync_");
  return creditAllocationOrchestrator.allocate({
    status,
    isStatusSync,
    existingData,
    creditLimit,
    isSubscriptionActive: isPremium && !isExpired,
    productId: metadata.productId,
  });
}

export function buildCreditsData({
  existingData, newCredits, creditLimit, purchaseId, metadata, purchaseHistory, platform
}: BuildCreditsDataParams): Record<string, any> {
  const isPremium = metadata.isPremium;
  const isExpired = metadata.expirationDate ? isPast(metadata.expirationDate) : false;
  const status = resolveSubscriptionStatus({
    isPremium,
    willRenew: metadata.willRenew ?? false,
    isExpired,
    periodType: metadata.periodType ?? undefined,
  });

  const creditsData: Record<string, any> = {
    isPremium,
    status,
    credits: newCredits,
    creditLimit,
    lastUpdatedAt: serverTimestamp(),
    processedPurchases: [...(existingData?.processedPurchases ?? []), purchaseId].slice(-50),
    productId: metadata.productId,
    platform,
  };

  if (purchaseHistory.length > 0) creditsData.purchaseHistory = purchaseHistory;
  if (purchaseId.startsWith("purchase_") || purchaseId.startsWith("renewal_")) creditsData.lastPurchaseAt = serverTimestamp();
  if (metadata.expirationDate) creditsData.expirationDate = Timestamp.fromDate(new Date(metadata.expirationDate));
  if (metadata.willRenew !== undefined) creditsData.willRenew = metadata.willRenew;
  if (metadata.originalTransactionId) creditsData.originalTransactionId = metadata.originalTransactionId;

  return creditsData;
}

export function shouldSkipStatusSyncWrite(
  purchaseId: string,
  existingData: any,
  newCreditsData: Record<string, any>
): boolean {
  if (!purchaseId.startsWith("status_sync_")) return false;
  return (
    existingData.isPremium === newCreditsData.isPremium &&
    existingData.status === newCreditsData.status &&
    existingData.credits === newCreditsData.credits &&
    existingData.creditLimit === newCreditsData.creditLimit &&
    existingData.productId === newCreditsData.productId
  );
}
