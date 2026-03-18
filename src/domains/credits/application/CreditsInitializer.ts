import type { CreditsConfig } from "../core/Credits";
import { getAppVersion, validatePlatform } from "../../../utils/appUtils";

import type { InitializeCreditsMetadata, InitializationResult } from "../../subscription/application/SubscriptionInitializerTypes";
import { runTransaction, type DocumentReference } from "firebase/firestore";
import type { Firestore } from "@umituz/react-native-firebase";
import { getCreditDocumentOrDefault } from "./creditDocumentHelpers";
import { calculateNewCredits, buildCreditsData } from "./creditOperationUtils";
import { CreditLimitService } from "../domain/services/CreditLimitService";
import { generatePurchaseMetadata } from "./PurchaseMetadataGenerator";
import { PURCHASE_ID_PREFIXES } from "../core/CreditsConstants";

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

    return runTransaction(_db, async (transaction) => {
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

        if (__DEV__) {
            console.log('[CreditsInitializer] 🔵 Processing credit allocation', {
                userId,
                purchaseId,
                existingCredits: existingData.credits,
                productId: metadata.productId,
            });
        }

        const creditLimitService = new CreditLimitService(config);
        const creditLimit = creditLimitService.calculate(metadata.productId);
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
