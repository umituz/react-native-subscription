import type { UserCreditsDocumentRead, FirestoreTimestamp } from "../core/UserCreditsDocument";
import { serverTimestamp } from "firebase/firestore";
import type { DocumentSnapshot } from "firebase/firestore";
import { SUBSCRIPTION_STATUS, type Platform } from "../../subscription/core/SubscriptionConstants";

export function getCreditDocumentOrDefault(
    creditsDoc: DocumentSnapshot,
    platform: Platform
): UserCreditsDocumentRead {
    if (creditsDoc.exists()) {
        const raw = creditsDoc.data() as Record<string, unknown>;
        // Ensure critical fields have safe defaults to prevent NaN/undefined propagation
        return {
            ...raw,
            credits: typeof raw.credits === 'number' && Number.isFinite(raw.credits) ? raw.credits : 0,
            creditLimit: typeof raw.creditLimit === 'number' && Number.isFinite(raw.creditLimit) ? raw.creditLimit : 0,
            processedPurchases: Array.isArray(raw.processedPurchases) ? raw.processedPurchases : [],
            purchaseHistory: Array.isArray(raw.purchaseHistory) ? raw.purchaseHistory : [],
            isPremium: typeof raw.isPremium === 'boolean' ? raw.isPremium : false,
        } as UserCreditsDocumentRead;
    }

    const now = serverTimestamp() as unknown as FirestoreTimestamp;

    const defaultDocument: UserCreditsDocumentRead = {
        credits: 0,
        creditLimit: 0,
        isPremium: false,
        status: SUBSCRIPTION_STATUS.NONE,
        processedPurchases: [],
        purchaseHistory: [],
        platform,
        lastUpdatedAt: now,
        purchasedAt: now,
        expirationDate: null,
        lastPurchaseAt: null,
        canceledAt: null,
        billingIssueDetectedAt: null,
        willRenew: false,
        productId: null,
        packageType: null,
        storeTransactionId: null,
        store: null,
        ownershipType: null,
        appVersion: null,
        periodType: null,
        purchaseSource: null,
        purchaseType: null,
    };

    return defaultDocument;
}
