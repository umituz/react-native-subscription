/**
 * Credit Operation Utilities
 * Business logic for credit calculations and data building
 */

import { resolveSubscriptionStatus } from "../../subscription/core/SubscriptionStatus";
import { creditAllocationOrchestrator } from "./credit-strategies/CreditAllocationOrchestrator";
import { isPast } from "../../../utils";
import type { UserCreditsDocumentRead } from "../core/UserCreditsDocument";
import type { InitializeCreditsMetadata } from "../../subscription/application/SubscriptionInitializerTypes";
import { serverTimestamp } from "firebase/firestore";

interface CalculateCreditsParams {
    metadata: InitializeCreditsMetadata;
    existingData: UserCreditsDocumentRead;
    creditLimit: number;
    purchaseId: string;
}

interface BuildCreditsDataParams {
    existingData: UserCreditsDocumentRead;
    newCredits: number;
    creditLimit: number;
    purchaseId: string;
    metadata: InitializeCreditsMetadata;
    purchaseHistory: any[];
    platform: "ios" | "android";
}

/**
 * Calculate new credits based on subscription status
 */
export function calculateNewCredits(params: CalculateCreditsParams): number {
    const { metadata, existingData, creditLimit, purchaseId } = params;

    const isPremium = metadata.isPremium;
    const isExpired = metadata.expirationDate ? isPast(metadata.expirationDate) : false;

    const status = resolveSubscriptionStatus({
        isPremium,
        willRenew: metadata.willRenew ?? false,
        isExpired,
        periodType: metadata.periodType ?? undefined,
    });

    const isStatusSync = purchaseId.startsWith("status_sync_");
    const isSubscriptionActive = isPremium && !isExpired;

    return creditAllocationOrchestrator.allocate({
        status,
        isStatusSync,
        existingData,
        creditLimit,
        isSubscriptionActive,
        productId: metadata.productId,
    });
}

/**
 * Build credits data object for Firestore update
 */
export function buildCreditsData(params: BuildCreditsDataParams): Record<string, any> {
    const {
        existingData,
        newCredits,
        creditLimit,
        purchaseId,
        metadata,
        purchaseHistory,
        platform,
    } = params;

    const isPremium = metadata.isPremium;
    const isExpired = metadata.expirationDate ? isPast(metadata.expirationDate) : false;

    const status = resolveSubscriptionStatus({
        isPremium,
        willRenew: metadata.willRenew ?? false,
        isExpired,
        periodType: metadata.periodType ?? undefined,
    });

    const newProcessedPurchases = addProcessedPurchase(existingData.processedPurchases, purchaseId);

    const creditsData: Record<string, any> = {
        isPremium,
        status,
        credits: newCredits,
        creditLimit,
        lastUpdatedAt: serverTimestamp(),
        processedPurchases: newProcessedPurchases,
    };

    if (purchaseHistory.length > 0) {
        creditsData.purchaseHistory = purchaseHistory;
    }

    const isNewPurchaseOrRenewal = purchaseId.startsWith("purchase_") || purchaseId.startsWith("renewal_");
    if (isNewPurchaseOrRenewal) {
        creditsData.lastPurchaseAt = serverTimestamp();
    }

    if (metadata.expirationDate) {
        creditsData.expirationDate = serverTimestamp();
    }

    if (metadata.willRenew !== undefined) {
        creditsData.willRenew = metadata.willRenew;
    }

    if (metadata.originalTransactionId) {
        creditsData.originalTransactionId = metadata.originalTransactionId;
    }

    creditsData.productId = metadata.productId;
    creditsData.platform = platform;

    return creditsData;
}

/**
 * Check if status sync write should be skipped (no changes)
 */
export function shouldSkipStatusSyncWrite(
    purchaseId: string,
    existingData: UserCreditsDocumentRead,
    newCreditsData: Record<string, any>
): boolean {
    const isStatusSync = purchaseId.startsWith("status_sync_");

    if (!isStatusSync) {
        return false;
    }

    const hasChanged =
        existingData.isPremium !== newCreditsData.isPremium ||
        existingData.status !== newCreditsData.status ||
        existingData.credits !== newCreditsData.credits ||
        existingData.creditLimit !== newCreditsData.creditLimit ||
        existingData.productId !== newCreditsData.productId;

    return !hasChanged;
}

/**
 * Add purchase ID to processed purchases list
 */
function addProcessedPurchase(
    existing: string[],
    purchaseId: string,
    limit: number = 50
): string[] {
    return [...existing, purchaseId].slice(-limit);
}
