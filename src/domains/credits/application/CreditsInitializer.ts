import { Platform } from "react-native";
import Constants from "expo-constants";
import {
  getFirestore,
} from "@umituz/react-native-firebase";
import {
  runTransaction,
  serverTimestamp,
  type Transaction,
  type DocumentReference,
} from "firebase/firestore";
import type { CreditsConfig } from "../core/Credits";
import type { UserCreditsDocumentRead } from "../core/UserCreditsDocument";
import { resolveSubscriptionStatus } from "../../subscription/core/SubscriptionStatus";
import { CreditLimitCalculator } from "./CreditLimitCalculator";
import { PurchaseMetadataGenerator } from "./PurchaseMetadataGenerator";
import { creditAllocationContext } from "./credit-strategies/CreditAllocationContext";
import type { InitializeCreditsMetadata, InitializationResult } from "../../subscription/application/SubscriptionInitializerTypes";

export async function initializeCreditsTransaction(
    db: ReturnType<typeof getFirestore>,
    creditsRef: DocumentReference,
    config: CreditsConfig,
    purchaseId?: string,
    metadata?: InitializeCreditsMetadata
): Promise<InitializationResult> {
    if (!db) {
        throw new Error("Firestore instance is not available");
    }
    return runTransaction(db, async (transaction: Transaction) => {
        const creditsDoc = await transaction.get(creditsRef);
        const now = serverTimestamp();
        const existingData = creditsDoc.exists() ? creditsDoc.data() as UserCreditsDocumentRead : null;

        if (existingData && purchaseId && existingData.processedPurchases?.includes(purchaseId)) {
            return { credits: existingData.credits, alreadyProcessed: true };
        }

        const creditLimit = CreditLimitCalculator.calculate(metadata?.productId, config);
        const { purchaseHistory } = PurchaseMetadataGenerator.generate({
          productId: metadata?.productId,
          source: metadata?.source,
          type: metadata?.type,
          creditLimit,
          platform: Platform.OS as "ios" | "android",
          appVersion: Constants.expoConfig?.version,
        }, existingData);

        const isPremium = metadata?.isPremium ?? true;
        const isExpired = metadata?.expirationDate ? new Date(metadata.expirationDate).getTime() < Date.now() : false;
        const status = resolveSubscriptionStatus({ 
          isPremium, willRenew: metadata?.willRenew, isExpired, periodType: metadata?.periodType 
        });

        // Resolve credits using Strategy Pattern
        const isStatusSync = purchaseId?.startsWith("status_sync_") ?? false;
        const isSubscriptionActive = isPremium && !isExpired;
        const productId = metadata?.productId;

        const newCredits = creditAllocationContext.allocate({
            status,
            isStatusSync,
            existingData,
            creditLimit,
            isSubscriptionActive,
            productId,
        });

        const creditsData: Record<string, any> = {
            isPremium, status, credits: newCredits, creditLimit, 
            lastUpdatedAt: now, 
            // Increase history window to 50 for better idempotency
            processedPurchases: (purchaseId ? [...(existingData?.processedPurchases || []), purchaseId].slice(-50) : existingData?.processedPurchases) || [],
            purchaseHistory: purchaseHistory.length ? purchaseHistory : undefined
        };

        const isNewPurchaseOrRenewal = purchaseId?.startsWith("purchase_") || purchaseId?.startsWith("renewal_");
        if (isNewPurchaseOrRenewal) creditsData.lastPurchaseAt = now;
        if (metadata?.expirationDate) creditsData.expirationDate = serverTimestamp();
        if (metadata?.willRenew !== undefined) creditsData.willRenew = metadata.willRenew;
        if (metadata?.originalTransactionId) creditsData.originalTransactionId = metadata.originalTransactionId;
        if (metadata?.productId) {
            creditsData.productId = metadata.productId;
            creditsData.platform = Platform.OS;
        }

        transaction.set(creditsRef, creditsData, { merge: true });
        
        const finalData = { ...(existingData || {}), ...creditsData } as UserCreditsDocumentRead;
        return { credits: newCredits, finalData };
    });
}
