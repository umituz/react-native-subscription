/**
 * Credit Document Operations
 * Handles Firestore credit document operations for subscription sync
 */

import { getCreditsRepository } from "../../../credits/infrastructure/CreditsRepositoryManager";
import type { PremiumStatusChangedEvent } from "../../core/SubscriptionEvents";
import { createLogger } from "../../../../shared/utils/logger";

const logger = createLogger("CreditDocumentOperations");

export class CreditDocumentOperations {
  async expireSubscription(userId: string): Promise<void> {
    await getCreditsRepository().syncExpiredStatus(userId);
  }

  async syncPremiumStatus(userId: string, event: PremiumStatusChangedEvent): Promise<void> {
    const repo = getCreditsRepository();

    logger.debug("syncPremiumStatus: Starting", {
      userId,
      isPremium: event.isPremium,
      productId: event.productId,
      willRenew: event.willRenew,
    });

    // Ensure premium user has a credits document (recovery)
    if (event.isPremium) {
      const created = await repo.ensurePremiumCreditsExist(
        userId,
        event.productId!,
        event.willRenew ?? false,
        event.expirationDate ?? null,
        event.periodType ?? null,
      );
      if (created) {
        logger.debug("Recovery: created missing credits document for premium user", {
          userId,
          productId: event.productId,
        });
      }
    }

    // Sync premium metadata
    await repo.syncPremiumMetadata(userId, {
      isPremium: event.isPremium,
      willRenew: event.willRenew ?? false,
      expirationDate: event.expirationDate ?? null,
      productId: event.productId!,
      periodType: event.periodType ?? null,
      unsubscribeDetectedAt: event.unsubscribeDetectedAt ?? null,
      billingIssueDetectedAt: event.billingIssueDetectedAt ?? null,
      store: event.store ?? null,
      ownershipType: event.ownershipType ?? null,
    });

    logger.debug("syncPremiumStatus: Completed", {
      userId,
      isPremium: event.isPremium,
      productId: event.productId,
    });
  }
}
