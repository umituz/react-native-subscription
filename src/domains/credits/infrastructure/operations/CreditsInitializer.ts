import type { Firestore, DocumentReference } from "@umituz/react-native-firebase";
import type { CreditsConfig, CreditsResult } from "../../core/Credits";
import type { UserCreditsDocumentRead, PurchaseSource } from "../../core/UserCreditsDocument";
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

function isTransientError(error: any): boolean {
  return (
    error?.code === 'already-exists' ||
    error?.code === 'DEADLINE_EXCEEDED' ||
    error?.code === 'UNAVAILABLE' ||
    error?.code === 'RESOURCE_EXHAUSTED' ||
    error?.message?.includes('already-exists') ||
    error?.message?.includes('timeout') ||
    error?.message?.includes('unavailable')
  );
}

export async function initializeCreditsWithRetry(params: InitializeCreditsParams): Promise<CreditsResult> {
  const { db, ref, config, purchaseId, productId, source, revenueCatData, type = PURCHASE_TYPE.INITIAL } = params;

  const creditLimit = calculateCreditLimit(productId, config);
  const cfg = { ...config, creditLimit };

  const maxRetries = 3;
  let lastError: any;

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
          type,
        }
      );

      return {
        success: true,
        data: result.finalData ? mapCreditsDocumentToEntity(result.finalData) : null,
        error: null,
      };
    } catch (error: any) {
      lastError = error;

      if (isTransientError(error) && attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
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

  const errorCode = lastError?.code ?? 'UNKNOWN_ERROR';

  return {
    success: false,
    data: null,
    error: {
      message: errorMessage,
      code: errorCode,
    },
  };
}
