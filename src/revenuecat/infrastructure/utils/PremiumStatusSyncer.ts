/**
 * Premium Status Syncer
 * Syncs premium status to database via callbacks
 */

import type { CustomerInfo } from "react-native-purchases";
import type { RevenueCatConfig } from '../../domain/value-objects/RevenueCatConfig';
import { getPremiumEntitlement } from '../../domain/types/RevenueCatTypes';
import { getExpirationDate } from "./ExpirationDateCalculator";
import {

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

      userId,
      isPremium,
    });
  } catch (error) {
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

    userId,
    productId,
  });

  try {
    await config.onPurchaseCompleted(userId, productId, customerInfo);

      userId,
      productId,
    });
  } catch (error) {
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

    userId,
    isPremium,
  });

  try {
    await config.onRestoreCompleted(userId, isPremium, customerInfo);

      userId,
      isPremium,
    });
  } catch (error) {
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
