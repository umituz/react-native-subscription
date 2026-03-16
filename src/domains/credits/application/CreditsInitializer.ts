import type { CreditsConfig } from "../core/Credits";
import { getAppVersion, validatePlatform } from "../../../utils/appUtils";

import type { InitializeCreditsMetadata, InitializationResult } from "../../subscription/application/SubscriptionInitializerTypes";
import { runTransaction, serverTimestamp, type Transaction, type DocumentReference, type Firestore } from "@umituz/react-native-firebase";
import { doc } from "firebase/firestore";
import { getCreditDocumentOrDefault } from "./creditDocumentHelpers";
import { calculateNewCredits, buildCreditsData } from "./creditOperationUtils";
import { calculateCreditLimit } from "./CreditLimitCalculator";
import { generatePurchaseMetadata } from "./PurchaseMetadataGenerator";
import { PURCHASE_ID_PREFIXES, TRANSACTION_SUBCOLLECTION } from "../core/CreditsConstants";

export async function initializeCreditsTransaction(
    _db: Firestore,
    creditsRef: DocumentReference,
    config: CreditsConfig,
    purchaseId: string,
    metadata: InitializeCreditsMetadata,
    userId: string
): Promise<InitializationResult> {

    if (__DEV__) {
        console.log('[CreditsInitializer] 🔵 initializeCreditsTransaction: START', {
            userId,
            purchaseId,
            productId: metadata.productId,
            source: metadata.source,
            type: metadata.type,
            isPremium: metadata.isPremium,
            willRenew: metadata.willRenew,
            storeTransactionId: metadata.storeTransactionId,
            timestamp: new Date().toISOString(),
        });
    }

    if (!purchaseId.startsWith(PURCHASE_ID_PREFIXES.PURCHASE) && !purchaseId.startsWith(PURCHASE_ID_PREFIXES.RENEWAL)) {
        throw new Error(`[CreditsInitializer] Only purchase and renewal operations can allocate credits. Received: ${purchaseId}`);
    }

    const platform = validatePlatform();
    const appVersion = getAppVersion();

    return runTransaction(async (transaction: Transaction) => {
        const creditsDoc = await transaction.get(creditsRef);

        const existingData = getCreditDocumentOrDefault(creditsDoc, platform);

        if (existingData.processedPurchases.includes(purchaseId)) {
            if (__DEV__) {
                console.log('[CreditsInitializer] 🟡 Transaction already processed, skipping', {
                    userId,
                    purchaseId,
                    existingCredits: existingData.credits,
                    processedPurchasesCount: existingData.processedPurchases.length,
                });
            }
            return {
                credits: existingData.credits,
                alreadyProcessed: true,
                finalData: existingData
            };
        }

        // User-specific transaction deduplication: prevent the same Apple/Google transaction
        // from allocating credits multiple times for the same user.
        // Path: users/{userId}/credits/processedTransactions/{transactionId}
        if (metadata.storeTransactionId) {
            const transactionRef = doc(_db, creditsRef.path, TRANSACTION_SUBCOLLECTION, metadata.storeTransactionId);
            const transactionDoc = await transaction.get(transactionRef);
            if (transactionDoc.exists()) {
                if (__DEV__) {
                    console.log('[CreditsInitializer] 🟡 Store transaction already processed, skipping', {
                        userId,
                        storeTransactionId: metadata.storeTransactionId,
                        existingCredits: existingData.credits,
                    });
                }
                return {
                    credits: existingData.credits,
                    alreadyProcessed: true,
                    finalData: existingData
                };
            }
        }

        if (__DEV__) {
            console.log('[CreditsInitializer] 🔵 Processing credit allocation', {
                userId,
                purchaseId,
                existingCredits: existingData.credits,
                productId: metadata.productId,
            });
        }

        const creditLimit = calculateCreditLimit(metadata.productId, config);
        const { purchaseHistory } = generatePurchaseMetadata({
            productId: metadata.productId,
            source: metadata.source,
            type: metadata.type,
            creditLimit,
            platform,
            appVersion,
        }, existingData);

        const newCredits = calculateNewCredits({
            metadata,
            existingData,
            creditLimit,
            purchaseId,
        });

        const creditsData = buildCreditsData({
            existingData,
            newCredits,
            creditLimit,
            purchaseId,
            metadata,
            purchaseHistory,
            platform,
        });

        transaction.set(creditsRef, creditsData, { merge: true });

        // Register transaction in user-specific subcollection to prevent duplicate processing.
        if (metadata.storeTransactionId) {
            const transactionRef = doc(_db, creditsRef.path, TRANSACTION_SUBCOLLECTION, metadata.storeTransactionId);
            transaction.set(transactionRef, {
                purchaseId,
                productId: metadata.productId,
                createdAt: serverTimestamp(),
            });
        }

        if (__DEV__) {
            console.log('[CreditsInitializer] 🟢 Credit allocation successful', {
                userId,
                purchaseId,
                previousCredits: existingData.credits,
                newCredits,
                creditLimit,
                productId: metadata.productId,
            });
        }

        return {
            credits: newCredits,
            alreadyProcessed: false,
            finalData: { ...existingData, ...creditsData }
        };
    });
}
