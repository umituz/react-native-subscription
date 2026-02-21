import type { CreditsConfig } from "../core/Credits";
import { getAppVersion, validatePlatform } from "../../../utils/appUtils";

import type { InitializeCreditsMetadata, InitializationResult } from "../../subscription/application/SubscriptionInitializerTypes";
import { runTransaction, type Transaction, type DocumentReference, type Firestore } from "@umituz/react-native-firebase";
import { getCreditDocumentOrDefault } from "./creditDocumentHelpers";
import { calculateNewCredits, buildCreditsData } from "./creditOperationUtils";
import { calculateCreditLimit } from "./CreditLimitCalculator";
import { generatePurchaseMetadata } from "./PurchaseMetadataGenerator";
import { PURCHASE_ID_PREFIXES } from "../core/CreditsConstants";

export async function initializeCreditsTransaction(
    _db: Firestore,
    creditsRef: DocumentReference,
    config: CreditsConfig,
    purchaseId: string,
    metadata: InitializeCreditsMetadata
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

        return {
            credits: newCredits,
            alreadyProcessed: false,
            finalData: { ...existingData, ...creditsData }
        };
    });
}
