import type { DocumentReference, Transaction, Firestore } from "@umituz/react-native-firebase";
import { runTransaction, serverTimestamp } from "@umituz/react-native-firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { SUBSCRIPTION_STATUS } from "../../../subscription/core/SubscriptionConstants";
import { resolveSubscriptionStatus } from "../../../subscription/core/SubscriptionStatus";
import type { SubscriptionMetadata } from "../../../subscription/core/types";
import { toTimestamp } from "../../../../shared/utils/dateConverter";
import { isPast } from "../../../../utils/dateUtils";
import { getAppVersion, validatePlatform } from "../../../../utils/appUtils";
import { GLOBAL_TRANSACTION_COLLECTION } from "../../core/CreditsConstants";

// Fix: was getDoc+setDoc (non-atomic) — now uses runTransaction so concurrent
// initializeCreditsTransaction and deductCreditsOperation no longer see stale
// updateTime preconditions that produce failed-precondition errors.
export async function syncExpiredStatus(ref: DocumentReference): Promise<void> {
  await runTransaction(async (tx: Transaction) => {
    const doc = await tx.get(ref);
    if (!doc.exists()) return;

    tx.update(ref, {
      isPremium: false,
      status: SUBSCRIPTION_STATUS.EXPIRED,
      willRenew: false,
      lastUpdatedAt: serverTimestamp(),
    });
  });
}

// Fix: was getDoc+setDoc (non-atomic) — now uses runTransaction.
export async function syncPremiumMetadata(
  ref: DocumentReference,
  metadata: SubscriptionMetadata
): Promise<void> {
  await runTransaction(async (tx: Transaction) => {
    const doc = await tx.get(ref);
    if (!doc.exists()) return;

    const isExpired = metadata.expirationDate ? isPast(metadata.expirationDate) : false;
    const status = resolveSubscriptionStatus({
      isPremium: metadata.isPremium,
      willRenew: metadata.willRenew,
      isExpired,
      periodType: metadata.periodType ?? undefined,
    });

    const expirationTimestamp = metadata.expirationDate ? toTimestamp(metadata.expirationDate) : null;
    const canceledAtTimestamp = metadata.unsubscribeDetectedAt ? toTimestamp(metadata.unsubscribeDetectedAt) : null;
    const billingIssueTimestamp = metadata.billingIssueDetectedAt ? toTimestamp(metadata.billingIssueDetectedAt) : null;

    tx.set(ref, {
      isPremium: metadata.isPremium,
      status,
      willRenew: metadata.willRenew,
      productId: metadata.productId,
      lastUpdatedAt: serverTimestamp(),
      ...(expirationTimestamp && { expirationDate: expirationTimestamp }),
      ...(canceledAtTimestamp && { canceledAt: canceledAtTimestamp }),
      ...(billingIssueTimestamp && { billingIssueDetectedAt: billingIssueTimestamp }),
      ...(metadata.store && { store: metadata.store }),
      ...(metadata.ownershipType && { ownershipType: metadata.ownershipType }),
    }, { merge: true });
  });
}

/**
 * Recovery: creates a credits document for premium users who don't have one.
 * This handles edge cases like test store purchases, reinstalls, or failed initializations.
 * Returns true if a new document was created, false if one already existed.
 *
 * Cross-user guard: if storeTransactionId is provided and already registered
 * to a different user in the global processedTransactions collection, the recovery
 * document is NOT created (the subscription belongs to another UID).
 */
export async function createRecoveryCreditsDocument(
  ref: DocumentReference,
  creditLimit: number,
  productId: string,
  willRenew: boolean,
  expirationDate: string | null,
  periodType: string | null,
  db?: Firestore,
  userId?: string,
  storeTransactionId?: string | null,
): Promise<boolean> {
  const existingDoc = await getDoc(ref);
  if (existingDoc.exists()) return false;

  // Cross-user deduplication: if this transaction was already processed by another
  // user, skip recovery to prevent double credit allocation across UIDs.
  if (db && userId && storeTransactionId) {
    try {
      const globalRef = doc(db, GLOBAL_TRANSACTION_COLLECTION, storeTransactionId);
      const globalDoc = await getDoc(globalRef);
      if (globalDoc.exists()) {
        const globalData = globalDoc.data();
        if (globalData?.ownerUserId && globalData.ownerUserId !== userId) {
          console.warn(
            `[CreditsWriter] Recovery skipped: transaction ${storeTransactionId} belongs to user ${globalData.ownerUserId}, not ${userId}`
          );
          return false;
        }
      }
    } catch (error) {
      // Non-fatal: if global check fails, still create recovery doc as safety net
      console.warn('[CreditsWriter] Global transaction check failed during recovery:', error);
    }
  }

  const platform = validatePlatform();
  const appVersion = getAppVersion();

  const isExpired = expirationDate ? isPast(expirationDate) : false;
  const status = resolveSubscriptionStatus({
    isPremium: true,
    willRenew,
    isExpired,
    periodType: periodType ?? undefined,
  });

  const expirationTimestamp = expirationDate ? toTimestamp(expirationDate) : null;

  await setDoc(ref, {
    credits: creditLimit,
    creditLimit,
    isPremium: true,
    status,
    willRenew,
    productId,
    platform,
    appVersion,
    processedPurchases: [],
    purchaseHistory: [],
    createdAt: serverTimestamp(),
    lastUpdatedAt: serverTimestamp(),
    recoveryInitialized: true,
    ...(expirationTimestamp && { expirationDate: expirationTimestamp }),
  });

  return true;
}
