
import {
    runTransaction,
    serverTimestamp,
    type Firestore,
    type FieldValue,
    type Transaction,
    type DocumentReference,
} from "firebase/firestore";
import type { CreditsConfig } from "@domain/entities/Credits";
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
    if (__DEV__) {
        console.log("[CreditsInitializer] Starting transaction with config:", {
            textCreditLimit: config.textCreditLimit,
            imageCreditLimit: config.imageCreditLimit,
            purchaseId,
        });
    }

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

            if (__DEV__) {
                console.log("[CreditsInitializer] Existing credits found:", {
                    textCredits: existing.textCredits,
                    imageCredits: existing.imageCredits,
                    processedPurchases,
                });
            }

            if (purchaseId && processedPurchases.includes(purchaseId)) {
                if (__DEV__) {
                    console.warn(
                        "[CreditsInitializer] Purchase already processed:",
                        purchaseId
                    );
                }
                return {
                    textCredits: existing.textCredits,
                    imageCredits: existing.imageCredits,
                    alreadyProcessed: true,
                };
            }

            newTextCredits = (existing.textCredits || 0) + config.textCreditLimit;
            newImageCredits = (existing.imageCredits || 0) + config.imageCreditLimit;

            if (__DEV__) {
                console.log("[CreditsInitializer] Adding to existing credits:", {
                    existingText: existing.textCredits || 0,
                    existingImage: existing.imageCredits || 0,
                    adding: {
                        text: config.textCreditLimit,
                        image: config.imageCreditLimit,
                    },
                    newTotal: {
                        text: newTextCredits,
                        image: newImageCredits,
                    },
                });
            }

            if (existing.purchasedAt) {
                purchasedAt = existing.purchasedAt as unknown as FieldValue;
            }
        } else {
            if (__DEV__) {
                console.log("[CreditsInitializer] Creating new credits document:", {
                    textCredits: newTextCredits,
                    imageCredits: newImageCredits,
                });
            }
        }

        if (purchaseId) {
            processedPurchases = [...processedPurchases, purchaseId].slice(-10);
        }

        transaction.set(creditsRef, {
            textCredits: newTextCredits,
            imageCredits: newImageCredits,
            purchasedAt,
            lastUpdatedAt: now,
            lastPurchaseAt: now,
            processedPurchases,
        });

        if (__DEV__) {
            console.log("[CreditsInitializer] Transaction completed successfully:", {
                textCredits: newTextCredits,
                imageCredits: newImageCredits,
            });
        }

        return { textCredits: newTextCredits, imageCredits: newImageCredits };
    });
}
