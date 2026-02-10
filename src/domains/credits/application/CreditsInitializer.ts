import type { CreditsConfig } from "../core/Credits";
import type { UserCreditsDocumentRead } from "../core/UserCreditsDocument";
import { getAppVersion, validatePlatform } from "../../../utils/appUtils";

import type { InitializeCreditsMetadata, InitializationResult } from "../../subscription/application/SubscriptionInitializerTypes";
import { runTransaction, type Transaction, type DocumentReference } from "firebase/firestore";
import type { Firestore } from "firebase/firestore";
import { getCreditDocumentOrDefault } from "./creditDocumentHelpers";
import { calculateNewCredits, buildCreditsData, shouldSkipStatusSyncWrite } from "./creditOperationUtils";
import { CreditLimitCalculator } from "./CreditLimitCalculator";
import { PurchaseMetadataGenerator } from "./PurchaseMetadataGenerator";

export async function initializeCreditsTransaction(
    db: Firestore,
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
        const platform = validatePlatform();

        const existingData = getCreditDocumentOrDefault(creditsDoc, platform);

        if (existingData.processedPurchases.includes(purchaseId)) {
            return {
                credits: existingData.credits,
                alreadyProcessed: true,
                finalData: existingData
            };
        }

        const creditLimit = CreditLimitCalculator.calculate(metadata.productId, config);
        const appVersion = getAppVersion();

        const { purchaseHistory } = PurchaseMetadataGenerator.generate({
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

        if (shouldSkipStatusSyncWrite(purchaseId, existingData, creditsData)) {
            return {
                credits: existingData.credits,
                alreadyProcessed: true,
                finalData: existingData
            };
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
