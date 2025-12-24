/**
 * Premium Status Syncer
 * Syncs premium status to database via callbacks
 */

import type { CustomerInfo } from "react-native-purchases";
import type { RevenueCatConfig } from "../domain/value-objects/RevenueCatConfig";
import { getPremiumEntitlement } from "../domain/types/RevenueCatTypes";
import { getExpirationDate } from "./ExpirationDateCalculator";
import {
  trackPackageError,
  addPackageBreadcrumb,
} from "@umituz/react-native-sentry";

export async function syncPremiumStatus(
  config: RevenueCatConfig,
  userId: string,
  customerInfo: CustomerInfo
): Promise<void> {
  if (!config.onPremiumStatusChanged) {
    return;
  }

  const entitlementIdentifier = config.entitlementIdentifier;
  const premiumEntitlement = getPremiumEntitlement(
    customerInfo,
    entitlementIdentifier
  );

  const isPremium = !!premiumEntitlement;

  addPackageBreadcrumb("subscription", "Syncing premium status", {
    userId,
    isPremium,
    productId: premiumEntitlement?.productIdentifier,
  });

  try {
    if (premiumEntitlement) {
      const productId = premiumEntitlement.productIdentifier;
      const expiresAt = getExpirationDate(premiumEntitlement);
      await config.onPremiumStatusChanged(
        userId,
        true,
        productId,
        expiresAt || undefined
      );
    } else {
      await config.onPremiumStatusChanged(userId, false);
    }

    addPackageBreadcrumb("subscription", "Premium status synced successfully", {
      userId,
      isPremium,
    });
  } catch (error) {
    trackPackageError(
      error instanceof Error ? error : new Error(String(error)),
      {
        packageName: "subscription",
        operation: "sync_premium_status",
        userId,
        isPremium,
      }
    );
  }
}

export async function notifyPurchaseCompleted(
  config: RevenueCatConfig,
  userId: string,
  productId: string,
  customerInfo: CustomerInfo
): Promise<void> {
  if (!config.onPurchaseCompleted) {
    return;
  }

  addPackageBreadcrumb("subscription", "Notifying purchase completed", {
    userId,
    productId,
  });

  try {
    await config.onPurchaseCompleted(userId, productId, customerInfo);

    addPackageBreadcrumb("subscription", "Purchase callback completed", {
      userId,
      productId,
    });
  } catch (error) {
    trackPackageError(
      error instanceof Error ? error : new Error(String(error)),
      {
        packageName: "subscription",
        operation: "purchase_callback",
        userId,
        productId,
      }
    );
  }
}

export async function notifyRestoreCompleted(
  config: RevenueCatConfig,
  userId: string,
  isPremium: boolean,
  customerInfo: CustomerInfo
): Promise<void> {
  if (!config.onRestoreCompleted) {
    return;
  }

  addPackageBreadcrumb("subscription", "Notifying restore completed", {
    userId,
    isPremium,
  });

  try {
    await config.onRestoreCompleted(userId, isPremium, customerInfo);

    addPackageBreadcrumb("subscription", "Restore callback completed", {
      userId,
      isPremium,
    });
  } catch (error) {
    trackPackageError(
      error instanceof Error ? error : new Error(String(error)),
      {
        packageName: "subscription",
        operation: "restore_callback",
        userId,
        isPremium,
      }
    );
  }
}
