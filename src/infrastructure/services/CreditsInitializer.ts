import { Platform } from "react-native";
import Constants from "expo-constants";
import {
    runTransaction,
    serverTimestamp,
    Timestamp,
    type Firestore,
    type FieldValue,
    type Transaction,
    type DocumentReference,
} from "firebase/firestore";
import type { CreditsConfig } from "../../domain/entities/Credits";
import type {
  UserCreditsDocumentRead,
  PurchaseSource,
  PurchaseType,
  PurchaseMetadata,
} from "../models/UserCreditsDocument";
import { SUBSCRIPTION_STATUS, resolveSubscriptionStatus, type PeriodType } from "../../domain/entities/SubscriptionStatus";
import { TRIAL_CONFIG } from "./TrialService";
import { detectPackageType } from "../../utils/packageTypeDetector";
import { getCreditAllocation } from "../../utils/creditMapper";

interface InitializationResult {
    credits: number;
}

/** RevenueCat data to save to Firestore (Single Source of Truth) */
export interface InitializeCreditsMetadata {
  productId?: string;
  source?: PurchaseSource;
  type?: PurchaseType;
  // RevenueCat subscription data
  expirationDate?: string | null;
  willRenew?: boolean;
  originalTransactionId?: string;
  isPremium?: boolean;
  /** RevenueCat period type: NORMAL, INTRO, or TRIAL */
  periodType?: PeriodType;
}

export async function initializeCreditsTransaction(
    db: Firestore,
    creditsRef: DocumentReference,
    config: CreditsConfig,
    purchaseId?: string,
    metadata?: InitializeCreditsMetadata
): Promise<InitializationResult> {
    return runTransaction(db, async (transaction: Transaction) => {
        const creditsDoc = await transaction.get(creditsRef);
        const now = serverTimestamp();

        let newCredits = config.creditLimit;
        let purchasedAt = now;
        let processedPurchases: string[] = [];

        if (creditsDoc.exists()) {
            const existing = creditsDoc.data() as UserCreditsDocumentRead;
            processedPurchases = existing.processedPurchases || [];

            if (purchaseId && processedPurchases.includes(purchaseId)) {
                return {
                    credits: existing.credits,
                    alreadyProcessed: true,
                } as any;
            }

            newCredits = config.creditLimit;

            if (existing.purchasedAt) {
                purchasedAt = existing.purchasedAt as unknown as FieldValue;
            }
        }

        if (purchaseId) {
            processedPurchases = [...processedPurchases, purchaseId].slice(-10);
        }

        // Detect package type and credit limit from productId
        const productId = metadata?.productId;
        const packageType = productId ? detectPackageType(productId) : undefined;
        const allocation = packageType && packageType !== "unknown"
          ? getCreditAllocation(packageType, config.packageAllocations)
          : null;
        const creditLimit = allocation || config.creditLimit;

        // Platform and app version
        const platform = Platform.OS as "ios" | "android";
        const appVersion = Constants.expoConfig?.version;

        // Determine purchase type
        let purchaseType: PurchaseType = metadata?.type ?? "initial";
        if (creditsDoc.exists()) {
          const existing = creditsDoc.data() as UserCreditsDocumentRead;
          if (existing.packageType && packageType !== "unknown") {
            const oldLimit = existing.creditLimit || 0;
            const newLimit = creditLimit;
            if (newLimit > oldLimit) {
              purchaseType = "upgrade";
            } else if (newLimit < oldLimit) {
              purchaseType = "downgrade";
            } else if (purchaseId?.startsWith("renewal_")) {
              purchaseType = "renewal";
            }
          }
        }

        // Create purchase metadata for history (only if productId and source exists and packageType detected)
        // NOTE: Cannot use serverTimestamp() in arrays, using Date.now() instead
        const purchaseMetadata: PurchaseMetadata | undefined =
          productId && metadata?.source && packageType && packageType !== "unknown" ? {
            productId,
            packageType,
            creditLimit,
            source: metadata.source,
            type: purchaseType,
            platform,
            appVersion,
            timestamp: Date.now() as any,  // Use Date.now() instead of serverTimestamp() for arrays
          } : undefined;

        // Update purchase history (keep last 10, only if metadata exists)
        const existing = creditsDoc.exists() ? creditsDoc.data() as UserCreditsDocumentRead : null;
        const purchaseHistory = purchaseMetadata
          ? [...(existing?.purchaseHistory || []), purchaseMetadata].slice(-10)
          : existing?.purchaseHistory;

        // Determine subscription status
        const isPremium = metadata?.isPremium ?? true;
        const willRenew = metadata?.willRenew;
        const periodType = metadata?.periodType;

        const status = resolveSubscriptionStatus({
            isPremium,
            willRenew,
            isExpired: !isPremium,
            periodType,
        });

        // Determine credits based on status
        // Trial: 5 credits, Trial canceled: 0 credits, Normal: plan-based credits
        if (status === SUBSCRIPTION_STATUS.TRIAL) {
            newCredits = TRIAL_CONFIG.CREDITS;
        } else if (status === SUBSCRIPTION_STATUS.TRIAL_CANCELED) {
            newCredits = 0;
        }

        // Build credits data (Single Source of Truth)
        const creditsData: Record<string, unknown> = {
            // Core subscription
            isPremium,
            status,

            // Credits
            credits: newCredits,
            creditLimit,

            // Dates
            purchasedAt,
            lastUpdatedAt: now,
            lastPurchaseAt: now,

            // Tracking
            processedPurchases,
        };

        // RevenueCat subscription data
        if (metadata?.expirationDate) {
            creditsData.expirationDate = Timestamp.fromDate(new Date(metadata.expirationDate));
        }
        if (metadata?.willRenew !== undefined) {
            creditsData.willRenew = metadata.willRenew;
        }
        if (metadata?.originalTransactionId) {
            creditsData.originalTransactionId = metadata.originalTransactionId;
        }

        // Package info
        if (packageType && packageType !== "unknown") {
            creditsData.packageType = packageType;
        }
        if (productId) {
            creditsData.productId = productId;
            creditsData.platform = platform;
            creditsData.appVersion = appVersion;
        }

        // Trial-specific fields
        const isTrialing = status === SUBSCRIPTION_STATUS.TRIAL || status === SUBSCRIPTION_STATUS.TRIAL_CANCELED;

        if (periodType) {
            creditsData.periodType = periodType;
        }
        if (isTrialing) {
            creditsData.isTrialing = status === SUBSCRIPTION_STATUS.TRIAL;
            creditsData.trialCredits = TRIAL_CONFIG.CREDITS;
            // Set trial dates if this is a new trial
            if (!existing?.trialStartDate) {
                creditsData.trialStartDate = now;
            }
            if (metadata?.expirationDate) {
                creditsData.trialEndDate = Timestamp.fromDate(new Date(metadata.expirationDate));
            }
        } else if (existing?.isTrialing && isPremium) {
            // User converted from trial to paid
            creditsData.isTrialing = false;
            creditsData.convertedFromTrial = true;
        }

        // Purchase metadata
        if (metadata?.source) {
            creditsData.purchaseSource = metadata.source;
        }
        if (metadata?.type) {
            creditsData.purchaseType = purchaseType;
        }
        if (purchaseHistory && purchaseHistory.length > 0) {
            creditsData.purchaseHistory = purchaseHistory;
        }

        transaction.set(creditsRef, creditsData, { merge: true });

        return { credits: newCredits };
    });
}
