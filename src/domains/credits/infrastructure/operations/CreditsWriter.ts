import type { DocumentReference, Transaction, Firestore } from "@umituz/react-native-firebase";
import { runTransaction, serverTimestamp } from "@umituz/react-native-firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { SUBSCRIPTION_STATUS } from "../../../subscription/core/SubscriptionConstants";
import { resolveSubscriptionStatus } from "../../../subscription/core/SubscriptionStatus";
import type { SubscriptionMetadata } from "../../../subscription/core/types/SubscriptionMetadata";
import { toTimestamp } from "../../../../shared/utils/dateConverter";
import { isPast } from "../../../../utils/dateUtils";
import { getAppVersion, validatePlatform } from "../../../../utils/appUtils";
import { TRANSACTION_SUBCOLLECTION } from "../../core/CreditsConstants";

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
 * NOTE: This uses non-atomic check-then-act (getDoc + setDoc). In theory, two concurrent
 * calls could both see no document and create duplicates. However, this is extremely rare
 * in practice because: (1) createRecoveryCreditsDocument is called after a successful
 * purchase which is already serialized, (2) the user-specific transaction check (below) prevents
 * duplicates, (3) even if two recovery docs are created, the credits document
 * logic is idempotent (same purchaseId processed twice is no-op). Making this atomic
 * would require a transaction spanning both the credits doc and transaction subcollection,
 * which adds complexity without meaningful benefit given the safeguards above.
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

  // User-specific deduplication: if this transaction was already processed
  // for this user, skip recovery to prevent duplicate credit allocation.
  if (db && userId && storeTransactionId) {
    try {
      const transactionRef = doc(db, ref.path, TRANSACTION_SUBCOLLECTION, storeTransactionId);
      const transactionDoc = await getDoc(transactionRef);
      if (transactionDoc.exists()) {
        if (__DEV__) {
          console.log(
            `[CreditsWriter] Recovery skipped: transaction ${storeTransactionId} already processed for user ${userId}`
          );
        }
        return false;
      }
    } catch (error) {
      // Non-fatal: if transaction check fails, still create recovery doc as safety net
      if (__DEV__) {
        console.warn('[CreditsWriter] Transaction check failed during recovery:', error);
      }
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
