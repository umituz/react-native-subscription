import { configureCreditsRepository } from "../../../credits/infrastructure/CreditsRepositoryManager";
import { SubscriptionManager } from "../../infrastructure/managers/SubscriptionManager";
import { configureAuthProvider } from "../../presentation/useAuthAwarePurchase";
import { SubscriptionSyncService } from "../SubscriptionSyncService";
import type { SubscriptionInitConfig } from "../SubscriptionInitializerTypes";
import type { CustomerInfo } from "react-native-purchases";
import type { PackageType } from "../../../revenuecat/core/types/RevenueCatTypes";

export function configureServices(config: SubscriptionInitConfig, apiKey: string): SubscriptionSyncService {
  const { entitlementId, credits, creditPackages, getFirebaseAuth, showAuthModal, onCreditsUpdated, getAnonymousUserId } = config;

  if (!creditPackages) {
    throw new Error('[ServiceConfigurator] creditPackages configuration is required');
  }

  configureCreditsRepository({
    ...credits,
    creditPackageAmounts: creditPackages.amounts
  });

  const syncService = new SubscriptionSyncService(entitlementId, getAnonymousUserId);

  SubscriptionManager.configure({
    config: {
      apiKey,
      entitlementIdentifier: entitlementId,
      consumableProductIdentifiers: [creditPackages.identifierPattern],
      onPurchaseCompleted: (
        u: string,
        p: string,
        c: CustomerInfo,
        s?: string,
        pkgType?: PackageType | null
      ) => syncService.handlePurchase(u, p, c, s as any, pkgType),
      onRenewalDetected: (
        u: string,
        p: string,
        expires: string,
        c: CustomerInfo
      ) => syncService.handleRenewal(u, p, expires, c),
      onPremiumStatusChanged: (
        u: string,
        isP: boolean,
        pId?: string,
        exp?: string,
        willR?: boolean,
        pt?: string
      ) => syncService.handlePremiumStatusChanged(u, isP, pId, exp, willR, pt as any),
      onCreditsUpdated,
    },
    apiKey,
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
