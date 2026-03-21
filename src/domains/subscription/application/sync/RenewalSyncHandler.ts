/**
 * Renewal Sync Handler
 * Handles subscription renewal credit allocation
 */

import { PURCHASE_SOURCE, PURCHASE_TYPE } from "../../core/SubscriptionConstants";
import { getCreditsRepository } from "../../../credits/infrastructure/CreditsRepositoryManager";
import { extractRevenueCatData } from "../SubscriptionSyncUtils";
import { generateRenewalId } from "../syncIdGenerators";
import type { RenewalDetectedEvent } from "../../core/SubscriptionEvents";
import { UserIdResolver } from "./UserIdResolver";
import { createLogger } from "../../../shared/utils/logger";

const logger = createLogger("RenewalSyncHandler");

export class RenewalSyncHandler {
  private renewalInProgress = false;

  constructor(
    private entitlementId: string,
    private userIdResolver: UserIdResolver
  ) {}

  isProcessing(): boolean {
    return this.renewalInProgress;
  }

  async processRenewal(event: RenewalDetectedEvent): Promise<void> {
    this.renewalInProgress = true;

    try {
      // Extract revenue cat data
      const revenueCatData = extractRevenueCatData(event.customerInfo, this.entitlementId);
      revenueCatData.expirationDate = event.newExpirationDate ?? revenueCatData.expirationDate;
      revenueCatData.revenueCatUserId = event.userId;

      // Generate renewal ID
      const purchaseId = generateRenewalId(
        revenueCatData.storeTransactionId,
        event.productId,
        event.newExpirationDate
      );

      // Resolve user ID
      const creditsUserId = await this.userIdResolver.resolveCreditsUserId(event.userId);

      // Initialize credits for renewal
      const result = await getCreditsRepository().initializeCredits(
        creditsUserId,
        purchaseId,
        event.productId,
        PURCHASE_SOURCE.RENEWAL,
        revenueCatData,
        PURCHASE_TYPE.RENEWAL
      );

      if (!result.success) {
        throw new Error(`[RenewalSyncHandler] Credit initialization failed: ${result.error?.message ?? 'unknown'}`);
      }

      logger.debug("Renewal credits allocated successfully", {
        creditsUserId,
        purchaseId,
        productId: event.productId,
      });
    } finally {
      this.renewalInProgress = false;
    }
  }
}
