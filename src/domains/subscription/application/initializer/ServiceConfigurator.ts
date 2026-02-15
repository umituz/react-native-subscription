import { configureCreditsRepository } from "../../../credits/infrastructure/CreditsRepositoryManager";
import { SubscriptionManager } from "../../infrastructure/managers/SubscriptionManager";
import { configureAuthProvider } from "../../presentation/useAuthAwarePurchase";
import { SubscriptionSyncService } from "../SubscriptionSyncService";
import type { SubscriptionInitConfig } from "../SubscriptionInitializerTypes";

export function configureServices(config: SubscriptionInitConfig, apiKey: string): SubscriptionSyncService {
  const { entitlementId, credits, creditPackages, getAnonymousUserId, getFirebaseAuth, showAuthModal, onCreditsUpdated } = config;

  configureCreditsRepository({
    ...credits,
    creditPackageAmounts: creditPackages!.amounts
  });

  const syncService = new SubscriptionSyncService(entitlementId);

  SubscriptionManager.configure({
    config: {
      apiKey,
      entitlementIdentifier: entitlementId,
      consumableProductIdentifiers: [creditPackages!.identifierPattern],
      onPurchaseCompleted: (u: string, p: string, c: any, s: any) => syncService.handlePurchase(u, p, c, s),
      onRenewalDetected: (u: string, p: string, expires: string, c: any) => syncService.handleRenewal(u, p, expires, c),
      onPremiumStatusChanged: (u: string, isP: boolean, pId: any, exp: any, willR: any, pt: any) => syncService.handlePremiumStatusChanged(u, isP, pId, exp, willR, pt),
      onCreditsUpdated,
    },
    apiKey,
    getAnonymousUserId: getAnonymousUserId!,
  });

  configureAuthProvider({
    isAuthenticated: () => {
      const auth = getFirebaseAuth();
      if (!auth) {
        throw new Error("Firebase auth is not available");
      }

      const u = auth.currentUser;
      return !!(u && !u.isAnonymous);
    },
    showAuthModal,
  });

  return syncService;
}
