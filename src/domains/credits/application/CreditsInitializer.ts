import { Platform } from "react-native";
import Constants from "expo-constants";
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
import { creditAllocationContext } from "./credit-strategies/CreditAllocationContext";
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
            : null;

        if (!existingData) {
            throw new Error("Credits document does not exist");
        }

        if (existingData.processedPurchases.includes(purchaseId)) {
            return {
                credits: existingData.credits,
                alreadyProcessed: true,
                finalData: existingData
            };
        }

        const creditLimit = CreditLimitCalculator.calculate(metadata.productId, config);

        const platform = Platform.OS;
        if (platform !== "ios" && platform !== "android") {
            throw new Error(`Invalid platform: ${platform}`);
        }

        const appVersion = Constants.expoConfig?.version;
        if (!appVersion) {
            throw new Error("appVersion is required in expoConfig");
        }

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
            isExpired = new Date(metadata.expirationDate).getTime() < Date.now();
        }

        const status = resolveSubscriptionStatus({
            isPremium,
            willRenew: metadata.willRenew ?? false,
            isExpired,
            periodType: metadata.periodType ?? undefined,
        });

        const isStatusSync = purchaseId.startsWith("status_sync_");
        const isSubscriptionActive = isPremium && !isExpired;

        const newCredits = creditAllocationContext.allocate({
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
