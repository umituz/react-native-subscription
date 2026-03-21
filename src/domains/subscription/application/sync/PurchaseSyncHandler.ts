/**
 * Purchase Sync Handler
 * Handles initial purchase credit allocation
 */

import { PURCHASE_SOURCE, PURCHASE_TYPE } from "../../core/SubscriptionConstants";
import { getCreditsRepository } from "../../../credits/infrastructure/CreditsRepositoryManager";
import { extractRevenueCatData } from "../SubscriptionSyncUtils";
import { generatePurchaseId } from "../syncIdGenerators";
import type { PurchaseCompletedEvent } from "../../core/SubscriptionEvents";
import { UserIdResolver } from "./UserIdResolver";
import { createLogger } from "../../../../shared/utils/logger";

const logger = createLogger("PurchaseSyncHandler");

export class PurchaseSyncHandler {
  private purchaseInProgress = false;

  constructor(
    private entitlementId: string,
    private userIdResolver: UserIdResolver
  ) {}

  isProcessing(): boolean {
    return this.purchaseInProgress;
  }

  async processPurchase(event: PurchaseCompletedEvent): Promise<void> {
    this.purchaseInProgress = true;

    logger.debug("Starting credit initialization", {
      productId: event.productId,
      source: event.source,
      packageType: event.packageType,
      activeEntitlements: Object.keys(event.customerInfo.entitlements.active),
    });

    try {
      // Extract revenue cat data
      const revenueCatData = extractRevenueCatData(event.customerInfo, this.entitlementId);
      revenueCatData.packageType = event.packageType ?? null;
      revenueCatData.revenueCatUserId = event.userId;

      // Generate purchase ID
      const purchaseId = generatePurchaseId(revenueCatData.storeTransactionId, event.productId);

      // Resolve user ID
      const creditsUserId = await this.userIdResolver.resolveCreditsUserId(event.userId);

      logger.debug("Calling initializeCredits", {
        creditsUserId,
        purchaseId,
        productId: event.productId,
        revenueCatUserId: revenueCatData.revenueCatUserId,
      });

      // Initialize credits
      const result = await getCreditsRepository().initializeCredits(
        creditsUserId,
        purchaseId,
        event.productId,
        event.source ?? PURCHASE_SOURCE.SETTINGS,
        revenueCatData,
        PURCHASE_TYPE.INITIAL
      );

      if (!result.success) {
        throw new Error(`[PurchaseSyncHandler] Credit initialization failed: ${result.error?.message ?? 'unknown'}`);
      }

      logger.debug("Credits initialized successfully", {
        creditsUserId,
        purchaseId,
        credits: result.data?.credits,
      });
    } finally {
      this.purchaseInProgress = false;
    }
  }
}
