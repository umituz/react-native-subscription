import Purchases from "react-native-purchases";
import type { RestoreResult } from "../../../../shared/application/ports/IRevenueCatService";
import { RevenueCatRestoreError, RevenueCatInitializationError } from "../../core/RevenueCatError";
import type { RevenueCatConfig } from "../../core/RevenueCatConfig";
import { getErrorMessage } from "../../core/RevenueCatTypes";
import { syncPremiumStatus, notifyRestoreCompleted } from "../utils/PremiumStatusSyncer";

export interface RestoreHandlerDeps {
  config: RevenueCatConfig;
  isInitialized: () => boolean;
}

export async function handleRestore(deps: RestoreHandlerDeps, userId: string): Promise<RestoreResult> {
  if (!deps.isInitialized()) throw new RevenueCatInitializationError();

  try {
    const customerInfo = await Purchases.restorePurchases();
    const isPremium = !!customerInfo.entitlements.active[deps.config.entitlementIdentifier];

    if (isPremium) {
      await syncPremiumStatus(deps.config, userId, customerInfo);
    }
    await notifyRestoreCompleted(deps.config, userId, isPremium, customerInfo);

    return { success: true, isPremium, customerInfo };
  } catch (error) {
    throw new RevenueCatRestoreError(getErrorMessage(error, "Restore failed"));
  }
}
