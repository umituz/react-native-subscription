import type { UserCreditsDocumentRead } from "../core/UserCreditsDocument";
import { serverTimestamp, type DocumentSnapshot } from "@umituz/react-native-firebase";
import { SUBSCRIPTION_STATUS, type Platform } from "../../subscription/core/SubscriptionConstants";

export function getCreditDocumentOrDefault(
    creditsDoc: DocumentSnapshot,
    platform: Platform
): UserCreditsDocumentRead {
    if (creditsDoc.exists()) {
        return creditsDoc.data() as UserCreditsDocumentRead;
    }

    const now = serverTimestamp() as any;

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
        originalTransactionId: null,
        store: null,
        ownershipType: null,
        appVersion: null,
        periodType: null,
        isTrialing: false,
        trialStartDate: null,
        trialEndDate: null,
        trialCredits: 0,
        convertedFromTrial: false,
        purchaseSource: null,
        purchaseType: null,
    };

    return defaultDocument;
}
