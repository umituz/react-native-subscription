import type { CreditsConfig } from "../core/Credits";
import { getAppVersion, validatePlatform } from "../../../utils/appUtils";

import type { InitializeCreditsMetadata, InitializationResult } from "../../subscription/application/SubscriptionInitializerTypes";
import { runTransaction, serverTimestamp, type Transaction, type DocumentReference, type Firestore } from "@umituz/react-native-firebase";
import { doc } from "firebase/firestore";
import { getCreditDocumentOrDefault } from "./creditDocumentHelpers";
import { calculateNewCredits, buildCreditsData } from "./creditOperationUtils";
import { calculateCreditLimit } from "./CreditLimitCalculator";
import { generatePurchaseMetadata } from "./PurchaseMetadataGenerator";
import { PURCHASE_ID_PREFIXES, GLOBAL_TRANSACTION_COLLECTION } from "../core/CreditsConstants";

export async function initializeCreditsTransaction(
    _db: Firestore,
    creditsRef: DocumentReference,
    config: CreditsConfig,
    purchaseId: string,
    metadata: InitializeCreditsMetadata,
    userId: string
): Promise<InitializationResult> {

    if (!purchaseId.startsWith(PURCHASE_ID_PREFIXES.PURCHASE) && !purchaseId.startsWith(PURCHASE_ID_PREFIXES.RENEWAL)) {
        throw new Error(`[CreditsInitializer] Only purchase and renewal operations can allocate credits. Received: ${purchaseId}`);
    }

    const platform = validatePlatform();
    const appVersion = getAppVersion();

    return runTransaction(async (transaction: Transaction) => {
        const creditsDoc = await transaction.get(creditsRef);

        const existingData = getCreditDocumentOrDefault(creditsDoc, platform);

        if (existingData.processedPurchases.includes(purchaseId)) {
            return {
                credits: existingData.credits,
                alreadyProcessed: true,
                finalData: existingData
            };
        }

        // Global cross-user deduplication: prevent the same Apple/Google transaction
        // from allocating credits under multiple Firebase UIDs.
        if (metadata.storeTransactionId) {
            const globalRef = doc(_db, GLOBAL_TRANSACTION_COLLECTION, metadata.storeTransactionId);
            const globalDoc = await transaction.get(globalRef);
            if (globalDoc.exists()) {
                const globalData = globalDoc.data();
                if (globalData?.ownerUserId && globalData.ownerUserId !== userId) {
                    console.warn(
                        `[CreditsInitializer] Transaction ${metadata.storeTransactionId} already processed by user ${globalData.ownerUserId}, skipping for ${userId}`
                    );
                    return {
                        credits: existingData.credits,
                        alreadyProcessed: true,
                        finalData: existingData
                    };
                }
            }
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

        // Register transaction globally so other UIDs cannot claim the same purchase.
        if (metadata.storeTransactionId) {
            const globalRef = doc(_db, GLOBAL_TRANSACTION_COLLECTION, metadata.storeTransactionId);
            transaction.set(globalRef, {
                ownerUserId: userId,
                purchaseId,
                productId: metadata.productId,
                createdAt: serverTimestamp(),
            });
        }

        return {
            credits: newCredits,
            alreadyProcessed: false,
            finalData: { ...existingData, ...creditsData }
        };
    });
}
