/**
 * Status Change Sync Handler
 * Handles premium status changes (expire, sync metadata, recovery)
 */

import { getCreditsRepository } from "../../../credits/infrastructure/CreditsRepositoryManager";
import type { PremiumStatusChangedEvent } from "../../core/SubscriptionEvents";
import { UserIdResolver } from "./UserIdResolver";
import { CreditDocumentOperations } from "./CreditDocumentOperations";
import { PurchaseSyncHandler } from "./PurchaseSyncHandler";
import { createLogger } from "../../../shared/utils/logger";

const logger = createLogger("StatusChangeSyncHandler");

export class StatusChangeSyncHandler {
  constructor(
    private userIdResolver: UserIdResolver,
    private creditOps: CreditDocumentOperations,
    private purchaseHandler: PurchaseSyncHandler
  ) {}

  async processStatusChange(event: PremiumStatusChangedEvent): Promise<void> {
    // If purchase is in progress, only do recovery sync
    if (this.purchaseHandler.isProcessing()) {
      logger.debug("Purchase in progress - running recovery only");
      if (event.isPremium && event.productId) {
        const creditsUserId = await this.userIdResolver.resolveCreditsUserId(event.userId);
        await this.creditOps.syncPremiumStatus(creditsUserId, event);
      }
      return;
    }

    const creditsUserId = await this.userIdResolver.resolveCreditsUserId(event.userId);

    // Expired subscription
    if (!event.isPremium && event.productId) {
      await this.creditOps.expireSubscription(creditsUserId);
      return;
    }

    // No product ID - check if credits doc exists and expire if needed
    if (!event.isPremium && !event.productId) {
      const hasDoc = await getCreditsRepository().creditsDocumentExists(creditsUserId);
      if (hasDoc) {
        await this.creditOps.expireSubscription(creditsUserId);
      }
      return;
    }

    // No product ID and is premium - nothing to do
    if (!event.productId) {
      return;
    }

    // Sync premium status (with recovery if needed)
    await this.creditOps.syncPremiumStatus(creditsUserId, event);
  }
}
