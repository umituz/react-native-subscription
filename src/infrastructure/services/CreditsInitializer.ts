import {
    runTransaction,
    serverTimestamp,
    type Firestore,
    type FieldValue,
    type Transaction,
    type DocumentReference,
} from "firebase/firestore";
import type { CreditsConfig } from "../../domain/entities/Credits";
import type { UserCreditsDocumentRead } from "../models/UserCreditsDocument";

interface InitializationResult {
    textCredits: number;
    imageCredits: number;
}

export async function initializeCreditsTransaction(
    db: Firestore,
    creditsRef: DocumentReference,
    config: CreditsConfig,
    purchaseId?: string
): Promise<InitializationResult> {
    return runTransaction(db, async (transaction: Transaction) => {
        const creditsDoc = await transaction.get(creditsRef);
        const now = serverTimestamp();

        let newTextCredits = config.textCreditLimit;
        let newImageCredits = config.imageCreditLimit;
        let purchasedAt = now;
        let processedPurchases: string[] = [];

        if (creditsDoc.exists()) {
            const existing = creditsDoc.data() as UserCreditsDocumentRead;
            processedPurchases = existing.processedPurchases || [];

            if (purchaseId && processedPurchases.includes(purchaseId)) {
                return {
                    textCredits: existing.textCredits,
                    imageCredits: existing.imageCredits,
                    alreadyProcessed: true,
                };
            }

            newTextCredits = (existing.textCredits || 0) + config.textCreditLimit;
            newImageCredits = (existing.imageCredits || 0) + config.imageCreditLimit;

            if (existing.purchasedAt) {
                purchasedAt = existing.purchasedAt as unknown as FieldValue;
            }
        }

        if (purchaseId) {
            processedPurchases = [...processedPurchases, purchaseId].slice(-10);
        }

        const creditsData = {
            textCredits: newTextCredits,
            imageCredits: newImageCredits,
            purchasedAt,
            lastUpdatedAt: now,
            lastPurchaseAt: now,
            processedPurchases,
        };

        // Use merge:true to avoid overwriting other user fields
        transaction.set(creditsRef, creditsData, { merge: true });

        return { textCredits: newTextCredits, imageCredits: newImageCredits };
    });
}
