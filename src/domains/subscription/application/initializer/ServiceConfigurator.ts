import { configureCreditsRepository } from "../../../credits/infrastructure/CreditsRepositoryManager";
import { SubscriptionManager } from "../../infrastructure/managers/SubscriptionManager";
import { configureAuthProvider } from "../../presentation/useAuthAwarePurchase";
import { SubscriptionSyncProcessor } from "../SubscriptionSyncProcessor";
import type { SubscriptionInitConfig } from "../SubscriptionInitializerTypes";

export function configureServices(config: SubscriptionInitConfig, apiKey: string): SubscriptionSyncProcessor {
  const { entitlementId, credits, creditPackages, getFirebaseAuth, showAuthModal, onCreditsUpdated, getAnonymousUserId } = config;

  if (!creditPackages) {
    throw new Error('[ServiceConfigurator] creditPackages configuration is required');
  }

  configureCreditsRepository({
    ...credits,
    creditPackageAmounts: creditPackages.amounts
  });

  const syncProcessor = new SubscriptionSyncProcessor(entitlementId, getAnonymousUserId);

  SubscriptionManager.configure({
    config: {
      apiKey,
      entitlementIdentifier: entitlementId,
      consumableProductIdentifiers: [creditPackages.identifierPattern],
      onPurchaseCompleted: async (event) => {
        await syncProcessor.handlePurchase(event);
      },
      onRenewalDetected: async (event) => {
        await syncProcessor.handleRenewal(event);
      },
      onPremiumStatusChanged: async (event) => {
        await syncProcessor.handlePremiumStatusChanged(event);
      },
      onCreditsUpdated,
    },
    apiKey,
  });

  configureAuthProvider({
    hasFirebaseUser: () => {
      const auth = getFirebaseAuth();
      return !!(auth?.currentUser);
    },
    showAuthModal,
  });

  return syncProcessor;
}
