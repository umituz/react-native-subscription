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
import { PURCHASE_ID_PREFIXES } from "../core/CreditsConstants";


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
    isStatusSync: purchaseId.startsWith(PURCHASE_ID_PREFIXES.STATUS_SYNC),
    existingData,
    creditLimit,
    isSubscriptionActive: isPremium && !isExpired,
    productId: metadata.productId,
  });
}

export function buildCreditsData({
  existingData, newCredits, creditLimit, purchaseId, metadata, purchaseHistory, platform
}: BuildCreditsDataParams): Record<string, any> {
  const isConsumable = isCreditPackage(metadata.productId ?? "");
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

  return {
    isPremium,
    status,
    credits: newCredits,
    creditLimit: resolvedCreditLimit,
    lastUpdatedAt: serverTimestamp(),
    processedPurchases: [...(existingData?.processedPurchases ?? []), purchaseId].slice(-50),
    productId: metadata.productId,
    platform,
    ...(purchaseHistory.length > 0 && { purchaseHistory }),
    ...(isPurchaseOrRenewal && { lastPurchaseAt: serverTimestamp() }),
    ...(metadata.expirationDate && {
      expirationDate: toTimestamp(metadata.expirationDate)
    }),
    ...(metadata.willRenew !== undefined && { willRenew: metadata.willRenew }),
    ...(metadata.originalTransactionId && { originalTransactionId: metadata.originalTransactionId }),
  };
}

export function shouldSkipStatusSyncWrite(
  purchaseId: string,
  existingData: any,
  newCreditsData: Record<string, any>
): boolean {
  if (!purchaseId.startsWith(PURCHASE_ID_PREFIXES.STATUS_SYNC)) return false;
  
  return existingData.isPremium === newCreditsData.isPremium &&
    existingData.status === newCreditsData.status &&
    existingData.credits === newCreditsData.credits &&
    existingData.creditLimit === newCreditsData.creditLimit &&
    existingData.productId === newCreditsData.productId;
}
