import {
  getFirestore,
} from "@umituz/react-native-firebase";
import {
  runTransaction,
  serverTimestamp,
  type Transaction,
  type DocumentReference,
} from "firebase/firestore";
import type { CreditsConfig } from "../core/Credits";
import type { UserCreditsDocumentRead } from "../core/UserCreditsDocument";
import { resolveSubscriptionStatus } from "../../subscription/core/SubscriptionStatus";
import { CreditLimitCalculator } from "./CreditLimitCalculator";
import { PurchaseMetadataGenerator } from "./PurchaseMetadataGenerator";
import { creditAllocationOrchestrator } from "./credit-strategies/CreditAllocationOrchestrator";
import { getAppVersion, validatePlatform, isPast } from "../../../utils";
import type { InitializeCreditsMetadata, InitializationResult } from "../../subscription/application/SubscriptionInitializerTypes";

export async function initializeCreditsTransaction(
    db: ReturnType<typeof getFirestore>,
    creditsRef: DocumentReference,
    config: CreditsConfig,
    purchaseId: string,
    metadata: InitializeCreditsMetadata
): Promise<InitializationResult> {
    if (!db) {
        throw new Error("Firestore instance is not available");
    }

    return runTransaction(db, async (transaction: Transaction) => {
        const creditsDoc = await transaction.get(creditsRef);
        const now = serverTimestamp();
        const existingData = creditsDoc.exists()
            ? creditsDoc.data() as UserCreditsDocumentRead
            : {
                credits: 0,
                creditLimit: 0,
                isPremium: false,
                status: "none",
                processedPurchases: [],
                purchaseHistory: [],
                platform: validatePlatform() as any,
                lastUpdatedAt: now,
                purchasedAt: now,
                expirationDate: null,
                lastPurchaseAt: null,
                willRenew: false,
                productId: null,
                packageType: null,
                originalTransactionId: null,
                appVersion: null,
                periodType: null,
                isTrialing: false,
                trialStartDate: null,
                trialEndDate: null,
                trialCredits: 0,
                convertedFromTrial: false,
            } as any;

        if (existingData.processedPurchases.includes(purchaseId)) {
            return {
                credits: existingData.credits,
                alreadyProcessed: true,
                finalData: existingData
            };
        }

        const creditLimit = CreditLimitCalculator.calculate(metadata.productId, config);

        const platform = validatePlatform();
        const appVersion = getAppVersion();

        const { purchaseHistory } = PurchaseMetadataGenerator.generate({
            productId: metadata.productId,
            source: metadata.source,
            type: metadata.type,
            creditLimit,
            platform,
            appVersion,
        }, existingData);

        const isPremium = metadata.isPremium;

        let isExpired = false;
        if (metadata.expirationDate) {
            isExpired = isPast(metadata.expirationDate);
        }

        const status = resolveSubscriptionStatus({
            isPremium,
            willRenew: metadata.willRenew ?? false,
            isExpired,
            periodType: metadata.periodType ?? undefined,
        });

        const isStatusSync = purchaseId.startsWith("status_sync_");
        const isSubscriptionActive = isPremium && !isExpired;

        const newCredits = creditAllocationOrchestrator.allocate({
            status,
            isStatusSync,
            existingData,
            creditLimit,
            isSubscriptionActive,
            productId: metadata.productId,
        });

        const newProcessedPurchases = [...existingData.processedPurchases, purchaseId].slice(-50);

        const creditsData: Record<string, any> = {
            isPremium,
            status,
            credits: newCredits,
            creditLimit,
            lastUpdatedAt: now,
            processedPurchases: newProcessedPurchases,
        };

        if (purchaseHistory.length > 0) {
            creditsData.purchaseHistory = purchaseHistory;
        }

        const isNewPurchaseOrRenewal = purchaseId.startsWith("purchase_")
            || purchaseId.startsWith("renewal_");

        if (isNewPurchaseOrRenewal) {
            creditsData.lastPurchaseAt = now;
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

        // Skip write if it's a status sync and data hasn't changed to save costs
        if (isStatusSync && existingData) {
            const hasChanged = 
                existingData.isPremium !== creditsData.isPremium ||
                existingData.status !== creditsData.status ||
                existingData.credits !== creditsData.credits ||
                existingData.creditLimit !== creditsData.creditLimit ||
                existingData.productId !== creditsData.productId;

            if (!hasChanged) {
                return {
                    credits: existingData.credits,
                    alreadyProcessed: true,
                    finalData: existingData
                };
            }
        }

        transaction.set(creditsRef, creditsData, { merge: true });

        const finalData: UserCreditsDocumentRead = {
            ...existingData,
            ...creditsData,
        };

        return {
            credits: newCredits,
            alreadyProcessed: false,
            finalData
        };
    });
}
