import type { PeriodType } from "../core/SubscriptionConstants";
import { getCreditsRepository } from "../../credits/infrastructure/CreditsRepositoryManager";
import { emitCreditsUpdated } from "./syncEventEmitter";

export const handleExpiredSubscription = async (userId: string): Promise<void> => {
  await getCreditsRepository().syncExpiredStatus(userId);
  emitCreditsUpdated(userId);
};

export const handlePremiumStatusSync = async (
  userId: string,
  isPremium: boolean,
  productId: string,
  expiresAt: string | null,
  willRenew: boolean,
  periodType: PeriodType | null,
  unsubscribeDetectedAt?: string | null,
  billingIssueDetectedAt?: string | null,
  store?: string | null,
  ownershipType?: string | null
): Promise<void> => {
  const repo = getCreditsRepository();

  // Recovery: if premium user has no credits document, create one.
  // Handles edge cases like test store, reinstalls, or failed purchase initialization.
  if (isPremium) {
    const created = await repo.ensurePremiumCreditsExist(
      userId,
      productId,
      willRenew,
      expiresAt,
      periodType,
    );
    if (__DEV__ && created) {
      console.log('[handlePremiumStatusSync] Recovery: created missing credits document for premium user', { userId, productId });
    }
  }

  await repo.syncPremiumMetadata(userId, {
    isPremium,
    willRenew,
    expirationDate: expiresAt,
    productId,
    periodType,
    unsubscribeDetectedAt: unsubscribeDetectedAt ?? null,
    billingIssueDetectedAt: billingIssueDetectedAt ?? null,
    store: store ?? null,
    ownershipType: ownershipType ?? null,
  });
  emitCreditsUpdated(userId);
};
