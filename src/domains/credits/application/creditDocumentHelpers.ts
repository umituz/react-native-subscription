/**
 * Credit Document Helpers
 * Utilities for getting and creating credit documents
 */

import type { UserCreditsDocumentRead } from "../core/UserCreditsDocument";
import { serverTimestamp, type DocumentSnapshot } from "@umituz/react-native-firebase";
import { SUBSCRIPTION_STATUS, type Platform } from "../../subscription/core/SubscriptionConstants";
/**
 * Get existing credit document or create default
 */
export function getCreditDocumentOrDefault(
    creditsDoc: DocumentSnapshot,
    platform: Platform
): UserCreditsDocumentRead {
    if (creditsDoc.exists()) {
        return creditsDoc.data() as UserCreditsDocumentRead;
    }

    const now = serverTimestamp() as any; // FieldValue for Firestore write

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
