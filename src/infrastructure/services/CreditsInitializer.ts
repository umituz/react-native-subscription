/**
 * Credits Initializer
 * Handles subscription credit initialization (NOT free credits)
 * Free credits are handled by CreditsRepository.initializeFreeCredits()
 */

import { Platform } from "react-native";
import Constants from "expo-constants";
import {
    runTransaction,
    serverTimestamp,
    Timestamp,
    type Firestore,
    type FieldValue,
    type Transaction,
    type DocumentReference,
} from "firebase/firestore";
import type { CreditsConfig } from "../../domain/entities/Credits";
import type {
  UserCreditsDocumentRead,
  PurchaseSource,
  PurchaseType,
  PurchaseMetadata,
} from "../models/UserCreditsDocument";
import { SUBSCRIPTION_STATUS, resolveSubscriptionStatus, type PeriodType } from "../../domain/entities/SubscriptionStatus";
import { TRIAL_CONFIG } from "./TrialService";
import { detectPackageType } from "../../utils/packageTypeDetector";
import { getCreditAllocation } from "../../utils/creditMapper";

interface InitializationResult {
    credits: number;
}

export interface InitializeCreditsMetadata {
  productId?: string;
  source?: PurchaseSource;
  type?: PurchaseType;
  expirationDate?: string | null;
  willRenew?: boolean;
  originalTransactionId?: string;
  isPremium?: boolean;
  periodType?: PeriodType;
}

export async function initializeCreditsTransaction(
    db: Firestore,
    creditsRef: DocumentReference,
    config: CreditsConfig,
    purchaseId?: string,
    metadata?: InitializeCreditsMetadata
): Promise<InitializationResult> {
    return runTransaction(db, async (transaction: Transaction) => {
        const creditsDoc = await transaction.get(creditsRef);
        const now = serverTimestamp();
        const existingData = creditsDoc.exists() ? creditsDoc.data() as UserCreditsDocumentRead : null;

        let purchasedAt: FieldValue = now;
        let processedPurchases: string[] = existingData?.processedPurchases || [];

        if (existingData && purchaseId && processedPurchases.includes(purchaseId)) {
            return { credits: existingData.credits, alreadyProcessed: true } as InitializationResult & { alreadyProcessed: boolean };
        }

        if (existingData?.purchasedAt) {
            purchasedAt = existingData.purchasedAt as unknown as FieldValue;
        }

        if (purchaseId) {
            processedPurchases = [...processedPurchases, purchaseId].slice(-10);
        }

        const productId = metadata?.productId;
        const packageType = productId ? detectPackageType(productId) : undefined;
        const allocation = packageType && packageType !== "unknown"
          ? getCreditAllocation(packageType, config.packageAllocations)
          : null;
        const creditLimit = allocation || config.creditLimit;

        const platform = Platform.OS as "ios" | "android";
        const appVersion = Constants.expoConfig?.version;

        let purchaseType: PurchaseType = metadata?.type ?? "initial";
        if (existingData?.packageType && packageType !== "unknown") {
            const oldLimit = existingData.creditLimit || 0;
            if (creditLimit > oldLimit) purchaseType = "upgrade";
            else if (creditLimit < oldLimit) purchaseType = "downgrade";
            else if (purchaseId?.startsWith("renewal_")) purchaseType = "renewal";
        }

        const purchaseMetadata: PurchaseMetadata | undefined =
          productId && metadata?.source && packageType && packageType !== "unknown" ? {
            productId,
            packageType,
            creditLimit,
            source: metadata.source,
            type: purchaseType,
            platform,
            appVersion,
            timestamp: Date.now() as unknown as PurchaseMetadata["timestamp"],
          } : undefined;

        const purchaseHistory = purchaseMetadata
          ? [...(existingData?.purchaseHistory || []), purchaseMetadata].slice(-10)
          : existingData?.purchaseHistory;

        const isPremium = metadata?.isPremium ?? true;
        const willRenew = metadata?.willRenew;
        const periodType = metadata?.periodType;

        const status = resolveSubscriptionStatus({ isPremium, willRenew, isExpired: !isPremium, periodType });

        // Determine if this is a status sync (not a new purchase or renewal)
        // Status sync should preserve existing credits, only update metadata
        const isStatusSync = purchaseId?.startsWith("status_sync_") ?? false;
        const isNewPurchaseOrRenewal = purchaseId?.startsWith("purchase_") || purchaseId?.startsWith("renewal_");

        let newCredits = creditLimit;
        if (status === SUBSCRIPTION_STATUS.TRIAL) {
            newCredits = TRIAL_CONFIG.CREDITS;
        } else if (status === SUBSCRIPTION_STATUS.TRIAL_CANCELED) {
            newCredits = 0;
        } else if (isStatusSync && existingData?.credits !== undefined && existingData.isPremium) {
            // Status sync for existing premium user: preserve current credits
            newCredits = existingData.credits;
        }

        const creditsData: Record<string, unknown> = {
            isPremium,
            status,
            credits: newCredits,
            creditLimit,
            // Clear free credits flag when user becomes premium
            isFreeCredits: false,
            purchasedAt,
            lastUpdatedAt: now,
            lastPurchaseAt: isNewPurchaseOrRenewal ? now : (existingData?.lastPurchaseAt ?? now),
            processedPurchases,
        };

        if (metadata?.expirationDate) creditsData.expirationDate = Timestamp.fromDate(new Date(metadata.expirationDate));
        if (metadata?.willRenew !== undefined) creditsData.willRenew = metadata.willRenew;
        if (metadata?.originalTransactionId) creditsData.originalTransactionId = metadata.originalTransactionId;
        if (packageType && packageType !== "unknown") creditsData.packageType = packageType;
        if (productId) {
            creditsData.productId = productId;
            creditsData.platform = platform;
            creditsData.appVersion = appVersion;
        }

        const isTrialing = status === SUBSCRIPTION_STATUS.TRIAL || status === SUBSCRIPTION_STATUS.TRIAL_CANCELED;
        if (periodType) creditsData.periodType = periodType;
        if (isTrialing) {
            creditsData.isTrialing = status === SUBSCRIPTION_STATUS.TRIAL;
            creditsData.trialCredits = TRIAL_CONFIG.CREDITS;
            if (!existingData?.trialStartDate) creditsData.trialStartDate = now;
            if (metadata?.expirationDate) creditsData.trialEndDate = Timestamp.fromDate(new Date(metadata.expirationDate));
        } else if (existingData?.isTrialing && isPremium) {
            creditsData.isTrialing = false;
            creditsData.convertedFromTrial = true;
        }

        if (metadata?.source) creditsData.purchaseSource = metadata.source;
        if (metadata?.type) creditsData.purchaseType = purchaseType;
        if (purchaseHistory?.length) creditsData.purchaseHistory = purchaseHistory;

        transaction.set(creditsRef, creditsData, { merge: true });

        return { credits: newCredits };
    });
}
