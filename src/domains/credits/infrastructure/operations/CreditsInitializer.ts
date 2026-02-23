import type { Firestore, DocumentReference } from "@umituz/react-native-firebase";
import type { CreditsConfig, CreditsResult } from "../../core/Credits";
import type { PurchaseSource } from "../../core/UserCreditsDocument";
import { initializeCreditsTransaction } from "../../application/CreditsInitializer";
import { mapCreditsDocumentToEntity } from "../../core/CreditsMapper";
import type { RevenueCatData } from "../../../revenuecat/core/types";
import { calculateCreditLimit } from "../../application/CreditLimitCalculator";
import { PURCHASE_TYPE, type PurchaseType } from "../../../subscription/core/SubscriptionConstants";

interface InitializeCreditsParams {
  db: Firestore;
  ref: DocumentReference;
  config: CreditsConfig;
  userId: string;
  purchaseId: string;
  productId: string;
  source: PurchaseSource;
  revenueCatData: RevenueCatData;
  type?: PurchaseType;
}

function isTransientError(error: unknown): boolean {
  const code = error instanceof Error ? (error as Error & { code?: string }).code : undefined;
  const message = error instanceof Error ? error.message : '';

  return (
    code === 'already-exists' ||
    code === 'DEADLINE_EXCEEDED' ||
    code === 'UNAVAILABLE' ||
    code === 'RESOURCE_EXHAUSTED' ||
    // Firestore transaction contention: document was modified between our read and write.
    // runTransaction does not auto-retry on failed-precondition, so we do it here.
    code === 'failed-precondition' ||
    code === 'FAILED_PRECONDITION' ||
    // Firestore transaction aborted due to concurrent modification.
    code === 'aborted' ||
    code === 'ABORTED' ||
    message.includes('already-exists') ||
    message.includes('timeout') ||
    message.includes('unavailable') ||
    message.includes('failed-precondition')
  );
}

export async function initializeCreditsWithRetry(params: InitializeCreditsParams): Promise<CreditsResult> {
  const { db, ref, config, purchaseId, productId, source, revenueCatData, type = PURCHASE_TYPE.INITIAL } = params;

  const creditLimit = calculateCreditLimit(productId, config);
  const cfg = { ...config, creditLimit };

  const maxRetries = 3;
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await initializeCreditsTransaction(
        db,
        ref,
        cfg,
        purchaseId,
        {
          productId,
          source,
          expirationDate: revenueCatData.expirationDate,
          willRenew: revenueCatData.willRenew,
          originalTransactionId: revenueCatData.originalTransactionId,
          isPremium: revenueCatData.isPremium,
          periodType: revenueCatData.periodType,
          unsubscribeDetectedAt: revenueCatData.unsubscribeDetectedAt,
          billingIssueDetectedAt: revenueCatData.billingIssueDetectedAt,
          store: revenueCatData.store,
          ownershipType: revenueCatData.ownershipType,
          revenueCatUserId: revenueCatData.revenueCatUserId,
          type,
        }
      );

      return {
        success: true,
        data: result.finalData ? mapCreditsDocumentToEntity(result.finalData) : null,
        error: null,
      };
    } catch (error: unknown) {
      lastError = error;

      if (isTransientError(error) && attempt < maxRetries - 1) {
        const baseDelay = 100;
        const maxDelay = 5000;
        const exponentialDelay = baseDelay * Math.pow(2, attempt);
        const jitter = Math.random() * baseDelay;
        const delay = Math.min(exponentialDelay + jitter, maxDelay);
        await new Promise<void>(resolve => setTimeout(() => resolve(), delay));
        continue;
      }
      break;
    }
  }

  const errorMessage = lastError instanceof Error
    ? lastError.message
    : typeof lastError === 'string'
      ? lastError
      : 'Unknown error during credit initialization';

  const errorCode = lastError instanceof Error
    ? (lastError as Error & { code?: string }).code ?? 'UNKNOWN_ERROR'
    : 'UNKNOWN_ERROR';

  return {
    success: false,
    data: null,
    error: {
      message: errorMessage,
      code: errorCode,
    },
  };
}
