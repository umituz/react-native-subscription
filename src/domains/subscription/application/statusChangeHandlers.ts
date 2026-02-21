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
  await getCreditsRepository().syncPremiumMetadata(userId, {
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
