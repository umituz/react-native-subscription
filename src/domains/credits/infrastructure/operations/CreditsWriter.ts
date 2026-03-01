import { getDoc, setDoc } from "firebase/firestore";
import type { DocumentReference } from "@umituz/react-native-firebase";
import { serverTimestamp } from "@umituz/react-native-firebase";
import { SUBSCRIPTION_STATUS } from "../../../subscription/core/SubscriptionConstants";
import { resolveSubscriptionStatus } from "../../../subscription/core/SubscriptionStatus";
import { toTimestamp } from "../../../../shared/utils/dateConverter";
import { isPast } from "../../../../utils/dateUtils";
import { getAppVersion, validatePlatform } from "../../../../utils/appUtils";

export async function syncExpiredStatus(ref: DocumentReference): Promise<void> {
  const doc = await getDoc(ref);
  if (!doc.exists()) {
    console.warn("[CreditsWriter] syncExpiredStatus: credits document does not exist, skipping.", ref.path);
    return;
  }

  await setDoc(ref, {
    isPremium: false,
    status: SUBSCRIPTION_STATUS.EXPIRED,
    willRenew: false,
    lastUpdatedAt: serverTimestamp(),
  }, { merge: true });
}

export interface PremiumMetadata {
  isPremium: boolean;
  willRenew: boolean;
  expirationDate: string | null;
  productId: string;
  periodType: string | null;
  unsubscribeDetectedAt: string | null;
  billingIssueDetectedAt: string | null;
  store: string | null;
  ownershipType: string | null;
}

export async function syncPremiumMetadata(
  ref: DocumentReference,
  metadata: PremiumMetadata
): Promise<void> {
  const doc = await getDoc(ref);
  if (!doc.exists()) {
    console.warn("[CreditsWriter] syncPremiumMetadata: credits document does not exist, skipping.", ref.path);
    return;
  }

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

  await setDoc(ref, {
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
}

/**
 * Recovery: creates a credits document for premium users who don't have one.
 * This handles edge cases like test store purchases, reinstalls, or failed initializations.
 * Returns true if a new document was created, false if one already existed.
 */
export async function createRecoveryCreditsDocument(
  ref: DocumentReference,
  creditLimit: number,
  productId: string,
  willRenew: boolean,
  expirationDate: string | null,
  periodType: string | null,
): Promise<boolean> {
  const doc = await getDoc(ref);
  if (doc.exists()) return false;

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
