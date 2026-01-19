/**
 * App Service Helpers
 * Creates ready-to-use service implementations for configureAppServices
 */

import { getCreditsRepository } from "../repositories/CreditsRepositoryProvider";
import { getRevenueCatService } from "../../revenuecat/infrastructure/services/RevenueCatService";
import { getPremiumEntitlement } from "../../revenuecat/domain/types/RevenueCatTypes";
import { creditsQueryKeys } from "../../presentation/hooks/useCredits";
import { paywallControl } from "../../presentation/hooks/usePaywallVisibility";
import {
  getGlobalQueryClient,
  hasGlobalQueryClient,
} from "@umituz/react-native-design-system";
import {
  useAuthStore,
  selectUserId,
} from "@umituz/react-native-auth";

declare const __DEV__: boolean;

export interface CreditServiceConfig {
  entitlementId: string;
}

export interface ICreditService {
  checkCredits: (cost: number) => Promise<boolean>;
  deductCredits: (cost: number) => Promise<void>;
  refundCredits: (amount: number, error?: unknown) => Promise<void>;
  calculateCost: (capability: string, metadata?: Record<string, unknown>) => number;
}

export interface IPaywallService {
  showPaywall: (requiredCredits: number) => void;
}

const checkPremiumStatus = async (entitlementId: string): Promise<boolean> => {
  try {
    const rcService = getRevenueCatService();
    if (!rcService) return false;

    const customerInfo = await rcService.getCustomerInfo();
    if (!customerInfo) return false;

    return !!getPremiumEntitlement(customerInfo, entitlementId);
  } catch {
    return false;
  }
};

/**
 * Creates a credit service implementation
 */
export function createCreditService(config: CreditServiceConfig): ICreditService {
  const { entitlementId } = config;

  return {
    checkCredits: async (cost: number): Promise<boolean> => {
      const userId = selectUserId(useAuthStore.getState());
      if (!userId) return false;

      // Premium users bypass credit check
      if (await checkPremiumStatus(entitlementId)) return true;

      try {
        const repository = getCreditsRepository();
        const result = await repository.getCredits(userId);
        if (!result.success || !result.data) return false;
        return (result.data.credits ?? 0) >= cost;
      } catch {
        return false;
      }
    },

    deductCredits: async (cost: number): Promise<void> => {
      const userId = selectUserId(useAuthStore.getState());
      if (!userId) return;

      // Premium users don't consume credits
      if (await checkPremiumStatus(entitlementId)) return;

      try {
        const repository = getCreditsRepository();
        await repository.deductCredit(userId, cost);

        if (hasGlobalQueryClient()) {
          getGlobalQueryClient().invalidateQueries({
            queryKey: creditsQueryKeys.user(userId),
          });
        }
      } catch (error) {
        if (typeof __DEV__ !== "undefined" && __DEV__) {
          console.error("[CreditService] Deduct error:", error);
        }
      }
    },

    refundCredits: async (): Promise<void> => {
      // No-op for now
    },

    calculateCost: (): number => 1,
  };
}

/**
 * Creates a paywall service implementation
 */
export function createPaywallService(): IPaywallService {
  return {
    showPaywall: () => paywallControl.open(),
  };
}
