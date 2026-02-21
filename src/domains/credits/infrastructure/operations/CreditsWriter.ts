import { getDoc, setDoc } from "firebase/firestore";
import type { DocumentReference } from "@umituz/react-native-firebase";
import { serverTimestamp } from "@umituz/react-native-firebase";
import { SUBSCRIPTION_STATUS } from "../../../subscription/core/SubscriptionConstants";
import { resolveSubscriptionStatus } from "../../../subscription/core/SubscriptionStatus";
import { toTimestamp } from "../../../../shared/utils/dateConverter";
import { isPast } from "../../../../utils/dateUtils";

export async function syncExpiredStatus(ref: DocumentReference): Promise<void> {
  const doc = await getDoc(ref);
  if (!doc.exists()) return;

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
