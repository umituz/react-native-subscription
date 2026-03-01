import { configureCreditsRepository } from "../../../credits/infrastructure/CreditsRepositoryManager";
import { SubscriptionManager } from "../../infrastructure/managers/SubscriptionManager";
import { configureAuthProvider } from "../../presentation/useAuthAwarePurchase";
import { SubscriptionSyncService } from "../SubscriptionSyncService";
import type { SubscriptionInitConfig } from "../SubscriptionInitializerTypes";
import type { CustomerInfo } from "react-native-purchases";
import type { PackageType } from "../../../revenuecat/core/types/RevenueCatTypes";
import { PURCHASE_SOURCE, PERIOD_TYPE, type PurchaseSource, type PeriodType } from "../../core/SubscriptionConstants";

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
      ) => {
        const validSource = s && Object.values(PURCHASE_SOURCE).includes(s as PurchaseSource) ? s as PurchaseSource : undefined;
        return syncService.handlePurchase(u, p, c, validSource, pkgType);
      },
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
      ) => {
        const validPeriodType = pt && Object.values(PERIOD_TYPE).includes(pt as PeriodType) ? pt as PeriodType : undefined;
        return syncService.handlePremiumStatusChanged(u, isP, pId, exp, willR, validPeriodType);
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

  return syncService;
}
