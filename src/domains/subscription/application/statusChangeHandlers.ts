import type { RevenueCatData } from "../../revenuecat/core/types";
import type { PeriodType } from "../core/SubscriptionConstants";
import { PURCHASE_SOURCE, PURCHASE_TYPE } from "../core/SubscriptionConstants";
import { getCreditsRepository } from "../../credits/infrastructure/CreditsRepositoryManager";
import { emitCreditsUpdated } from "./syncEventEmitter";
import { generateInitSyncId, generateStatusSyncId } from "./syncIdGenerators";
import { NO_SUBSCRIPTION_PRODUCT_ID, DEFAULT_FREE_USER_DATA } from "./syncConstants";

declare const __DEV__: boolean;

export const handleExpiredSubscription = async (userId: string): Promise<void> => {
  await getCreditsRepository().syncExpiredStatus(userId);
  emitCreditsUpdated(userId);
};

export const handleFreeUserInitialization = async (userId: string): Promise<void> => {
  const stableSyncId = generateInitSyncId(userId);
  await getCreditsRepository().initializeCredits(
    userId,
    stableSyncId,
    NO_SUBSCRIPTION_PRODUCT_ID,
    PURCHASE_SOURCE.SETTINGS,
    DEFAULT_FREE_USER_DATA,
    PURCHASE_TYPE.INITIAL
  );
  emitCreditsUpdated(userId);
};

export const handlePremiumStatusSync = async (
  userId: string,
  isPremium: boolean,
  productId: string,
  expiresAt: string | null,
  willRenew: boolean,
  periodType: PeriodType | null
): Promise<void> => {
  if (typeof __DEV__ !== "undefined" && __DEV__) {
    console.log("[StatusChangeHandlers] handlePremiumStatusSync called:", {
      userId,
      isPremium,
      productId,
      expiresAt,
      willRenew,
      periodType,
    });
  }

  const revenueCatData: RevenueCatData = {
    expirationDate: expiresAt,
    willRenew,
    isPremium,
    periodType,
    packageType: null,
    originalTransactionId: null,
    unsubscribeDetectedAt: null,
    billingIssueDetectedAt: null,
    store: null,
    ownershipType: null
  };

  const statusSyncId = generateStatusSyncId(userId, isPremium);

  if (typeof __DEV__ !== "undefined" && __DEV__) {
    console.log("[StatusChangeHandlers] Calling initializeCredits with:", {
      userId,
      statusSyncId,
      productId,
      source: PURCHASE_SOURCE.SETTINGS,
      type: PURCHASE_TYPE.INITIAL,
    });
  }

  await getCreditsRepository().initializeCredits(
    userId,
    statusSyncId,
    productId,
    PURCHASE_SOURCE.SETTINGS,
    revenueCatData,
    PURCHASE_TYPE.INITIAL
  );

  if (typeof __DEV__ !== "undefined" && __DEV__) {
    console.log("[StatusChangeHandlers] initializeCredits completed, emitting credits updated event");
  }

  emitCreditsUpdated(userId);

  if (typeof __DEV__ !== "undefined" && __DEV__) {
    console.log("[StatusChangeHandlers] ✅ handlePremiumStatusSync completed successfully");
  }
};
